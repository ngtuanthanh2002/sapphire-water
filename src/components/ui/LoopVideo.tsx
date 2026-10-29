"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";

/**
 * Ambient background footage — muted, inline, looping, and never a "player".
 *
 * - The poster is a real image underneath; the video only fades in once it is
 *   actually playing. If a browser refuses autoplay (iOS Low Power Mode,
 *   in-app WebViews), visitors see the still frame — never a play button.
 * - Native controls are suppressed (see `.ambient-video` in globals.css), and
 *   a transparent shield takes every tap / long-press, so nothing can be
 *   played, paused, saved, copied or opened full screen.
 * - Lazy by default: nothing downloads until the frame nears the viewport,
 *   and playback pauses whenever it leaves or the tab is hidden.
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
  /** `sizes` for the poster image. */
  sizes?: string;
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
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    // Belt and braces for iOS / in-app WebViews (React sets these as props)
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
        /* refused — poster stays; we retry on the first touch */
      });
    };
    // `timeupdate` (not `playing`): it also fires for footage that autoplayed
    // before hydration, and only once frames are really advancing.
    const onPlaying = () => {
      video.playbackRate = rate;
      setPlaying(true);
      video.removeEventListener("timeupdate", onPlaying);
    };
    // Some WebViews only allow playback after a user gesture: retry once then
    const onGesture = () => play();
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
    video.addEventListener("timeupdate", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("touchend", onGesture, { passive: true });
    document.addEventListener("click", onGesture);
    return () => {
      io.disconnect();
      video.removeEventListener("timeupdate", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchend", onGesture);
      document.removeEventListener("click", onGesture);
    };
  }, [reduce, rate, rootMargin]);

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
        className={`object-cover select-none pointer-events-none ${className}`}
      />
      {!reduce && (
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
        style={{ WebkitTouchCallout: "none" }}
        onContextMenu={block}
        onDragStart={block}
        onCopy={block}
      />
    </>
  );
}
