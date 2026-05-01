"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";

type Props = {
  title: string;
  videoUrl: string;
};

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

export function LiveClassVideoPlayer({ title, videoUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const iframe = containerRef.current?.querySelector("iframe");
    if (!iframe) return;

    let attempts = 5;

    const tryPlay = () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "playVideo",
          args: [],
        }),
        "*",
      );

      attempts--;

      if (attempts > 0) {
        setTimeout(tryPlay, 200);
      }
    };

    tryPlay();
  }, [videoUrl]);
  /* ---------- fullscreen ---------- */
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function handleFullscreen() {
    const el = containerRef.current as FullscreenElement | null;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      }
    } catch {}
  }

  return (
    <div ref={containerRef} className="relative aspect-video w-full">
      <iframe
        title={title}
        src={videoUrl}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
      />

      <button
        type="button"
        onClick={handleFullscreen}
        className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black/80"
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
