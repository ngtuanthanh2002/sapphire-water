"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Muted, looping ambient video. Nothing is downloaded until the frame nears
 * the viewport; playback pauses whenever it leaves, so off-screen loops never
 * cost CPU. With reduced motion the poster stands in for the footage.
 * No controls, context menu, download, PiP or casting.
 */
export default function LoopVideo({
  src,
  poster,
  label,
  className,
  rate = 1,
  rootMargin = "0px 40% 0px 40%",
}: {
  src: string;
  poster: string;
  label?: string;
  className?: string;
  /** Playback speed — below 1 lets the water breathe rather than churn. */
  rate?: number;
  /** How early (around the viewport) loading and playback start. */
  rootMargin?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    video.muted = true;
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
    const applyRate = () => (video.playbackRate = rate);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== "auto") {
            video.preload = "auto";
            video.load();
          }
          video.play().catch(() => {
            /* autoplay refused (e.g. data saver) — poster remains */
          });
        } else {
          video.pause();
        }
      },
      { rootMargin }
    );
    io.observe(video);
    video.addEventListener("loadeddata", applyRate);
    return () => {
      io.disconnect();
      video.removeEventListener("loadeddata", applyRate);
    };
  }, [reduce, rate, rootMargin]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      draggable={false}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
