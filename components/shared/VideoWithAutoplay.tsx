"use client";

import React, { useRef, useEffect } from "react";

type VideoWithAutoplayProps = {
  src: string;
  className?: string;
};

/**
 * Video component with muted autoplay and mobile-friendly attributes (playsInline, etc.).
 * Use for hero/section backgrounds where autoplay is required.
 */
export function VideoWithAutoplay({ src, className }: VideoWithAutoplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        setTimeout(async () => {
          try {
            await video.play();
          } catch {
            // Autoplay failed (e.g. policy); ignore
          }
        }, 200);
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener("loadeddata", playVideo, { once: true });
      video.addEventListener("canplay", playVideo, { once: true });
      video.load();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      autoPlay
      preload="none"
    />
  );
}
