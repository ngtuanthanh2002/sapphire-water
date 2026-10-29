"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  canPlayInline,
  canPlayInlineOnServer,
  markInlineBroken,
  subscribeInline,
} from "@/lib/inlineVideo";

type WebKitVideo = HTMLVideoElement & {
  webkitDisplayingFullscreen?: boolean;
  webkitExitFullscreen?: () => void;
  webkitPresentationMode?: "inline" | "fullscreen" | "picture-in-picture";
  webkitSetPresentationMode?: (mode: "inline") => void;
};

/**
 * Ambient background footage — muted, inline, looping, and never a "player".
 *
 * - The poster is a real image underneath; the video only fades in once its
 *   frames are actually advancing. Where autoplay is refused, visitors see the
 *   still frame — never a play button.
 * - Playback is only ever started by the page, never by a tap: in WebViews
 *   without inline playback a gesture-started `play()` opens full screen.
 * - Where inline playback isn't possible (iOS in-app browsers) no <video> is
 *   mounted at all; the still frame breathes gently instead.
 * - If a video still manages to enter full screen, it is pulled back and
 *   every ambient video on the page falls back to its poster.
 * - Native controls are suppressed (`.ambient-video` in globals.css) and a
 *   transparent shield takes every tap / long-press / drag.
 * - Lazy by default; pauses off-screen and in hidden tabs.
 *
 * Callers position it: the parent must be `relative`/`absolute`.
 */
export default function LoopVideo({
  src,
  poster,
  label,
  className = "",
  rate = 1,
  rootMargin = "0px 40% 0px 40%",
  eager = false,
  sizes = "100vw",
}: {
  src: string;
  poster: string;
  label?: string;
  className?: string;
  /** Playback speed — below 1 lets the water breathe rather than churn. */
  rate?: number;
  /** How early (around the viewport) loading and playback start. */
  rootMargin?: string;
  /** Above the fold: load immediately and preload the poster. */
  eager?: boolean;
  /** `sizes` for the poster image. */
  sizes?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const inline = useSyncExternalStore(subscribeInline, canPlayInline, canPlayInlineOnServer);
  const [playing, setPlaying] = useState(false);
  const useVideo = inline && !reduce;

  useEffect(() => {
    const video = ref.current as WebKitVideo | null;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;

    let visible = false;
    const play = () => {
      if (!visible || document.hidden) return;
      video.play().catch(() => {
        /* refused — the poster stays; we never retry from a tap */
      });
    };
    // `timeupdate` (not `playing`): it also fires for footage that autoplayed
    // before hydration, and only once frames are really advancing.
    const onAdvancing = () => {
      video.playbackRate = rate;
      setPlaying(true);
      video.removeEventListener("timeupdate", onAdvancing);
    };
    // Safety net: never let background footage become a full-screen player
    const bail = () => {
      try {
        if (video.webkitPresentationMode && video.webkitPresentationMode !== "inline") {
          video.webkitSetPresentationMode?.("inline");
        }
        if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
        if (document.fullscreenElement === video) void document.exitFullscreen();
      } catch {
        /* nothing more we can do — the poster takes over below */
      }
      video.pause();
      markInlineBroken();
    };
    const onPresentation = () => {
      if (video.webkitPresentationMode && video.webkitPresentationMode !== "inline") bail();
    };
    const onFullscreen = () => {
      if (document.fullscreenElement === video) bail();
    };
    const onVisibility = () => (document.hidden ? video.pause() : play());

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (video.preload !== "auto") {
            video.preload = "auto";
            video.load();
          }
          play();
        } else {
          video.pause();
        }
      },
      { rootMargin }
    );
    io.observe(video);
    video.addEventListener("timeupdate", onAdvancing);
    video.addEventListener("webkitbeginfullscreen", bail);
    video.addEventListener("webkitpresentationmodechanged", onPresentation);
    video.addEventListener("enterpictureinpicture", bail);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      video.pause();
      video.removeEventListener("timeupdate", onAdvancing);
      video.removeEventListener("webkitbeginfullscreen", bail);
      video.removeEventListener("webkitpresentationmodechanged", onPresentation);
      video.removeEventListener("enterpictureinpicture", bail);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [useVideo, rate, rootMargin]);

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <>
      <Image
        src={poster}
        alt={label ?? ""}
        fill
        sizes={sizes}
        preload={eager}
        draggable={false}
        className={`object-cover select-none pointer-events-none ${inline ? "" : "ambient-still"} ${className}`}
      />
      {useVideo && (
        <video
          ref={ref}
          className={`ambient-video ${className}`}
          style={{ opacity: playing ? 1 : 0, transition: "opacity 0.8s ease" }}
          src={src}
          aria-hidden
          muted
          loop
          playsInline
          autoPlay={eager}
          preload={eager ? "auto" : "none"}
          tabIndex={-1}
          draggable={false}
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          onContextMenu={block}
        />
      )}
      {/* Shield: takes taps, long-presses and drags so the footage is inert */}
      <span
        aria-hidden
        className="absolute inset-0 select-none"
        style={{ WebkitTouchCallout: "none", touchAction: "manipulation" }}
        onContextMenu={block}
        onDragStart={block}
        onCopy={block}
      />
    </>
  );
}
