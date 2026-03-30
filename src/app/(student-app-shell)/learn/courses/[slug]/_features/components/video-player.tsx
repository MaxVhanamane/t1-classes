import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { extractVimeoId } from "../helper-functions/video";
import { CourseUnitContent } from "../types/course-unit-content";
import { ChevronDown, Maximize, Minimize } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  unit: CourseUnitContent;
};

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenOrientation = ScreenOrientation & {
  lock?: (orientation: "portrait" | "landscape") => Promise<void>;
};

function getYouTubeEmbedUrl(url?: string | null): string {
  if (!url) return "";

  const parsed = new URL(url);
  let videoId: string | null = parsed.searchParams.get("v");

  if (!videoId && parsed.hostname === "youtu.be") {
    videoId = parsed.pathname.slice(1);
  }

  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&controls=1&fs=0&iv_load_policy=3`
    : "";
}

function getEmbedUrl(unit: Props["unit"]): string {
  if (unit.videoProvider === "youtube") {
    return getYouTubeEmbedUrl(unit.contentUrl);
  }
  if (unit.videoProvider === "vimeo") {
    return `https://player.vimeo.com/video/${extractVimeoId(unit.contentUrl)}`;
  }
  return "";
}

export function VideoPlayer({ unit }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasDescription = Boolean(unit.description);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<number | null>(null);

  const [overlayRightOffset, setOverlayRightOffset] = useState(158);
  useEffect(() => {
    const isMobileDevice = () => {
      return (
        typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      );
    };

    const isTouchDevice = () => {
      return (
        typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
      );
    };

    const updateOffset = () => {
      const isMobile = isMobileDevice() || isTouchDevice();
      const isFullscreen = Boolean(document.fullscreenElement);
      const isLandscape = window.innerWidth > window.innerHeight;

      let offset = 158; // desktop safe default

      if (isMobile) {
        if (isFullscreen || isLandscape) {
          // fullscreen mobile → controls are bigger
          offset = 220;
        } else {
          // normal mobile
          offset = 170;
        }
      }

      setOverlayRightOffset(offset);
    };

    updateOffset();

    window.addEventListener("resize", updateOffset);
    document.addEventListener("fullscreenchange", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      document.removeEventListener("fullscreenchange", updateOffset);
    };
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleFullscreen = async (): Promise<void> => {
    const el = containerRef.current as FullscreenElement | null;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }

        const orientation = screen.orientation as FullscreenOrientation;
        if (orientation?.lock) {
          await orientation.lock("landscape");
        }
      }
    } catch {}
  };

  const preventAction = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInteraction = () => {
    setShowControls(true);

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    const delay = window.innerWidth < 768 ? 4000 : 2000;

    hideTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, delay);
  };

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onTouchEnd={handleInteraction}
        className="relative aspect-video w-full bg-muted lg:rounded-xl overflow-hidden"
      >
        <iframe
          sandbox="allow-scripts allow-same-origin"
          src={getEmbedUrl(unit)}
          className="absolute inset-0 h-full w-full lg:rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />

        <div
          className="absolute top-0 left-0 h-13 bg-transparent z-10"
          style={{
            width: `calc(100% - ${overlayRightOffset}px)`,
          }}
          onClick={preventAction}
          onContextMenu={preventAction}
        />

        <div
          className="absolute bottom-0 right-0 w-full h-10 lg:h-12.5 bg-transparent z-10"
          onClick={preventAction}
          onContextMenu={preventAction}
        />

        <button
          onClick={handleFullscreen}
          className={cn(
            "absolute bottom-14 min-[392px]:bottom-20 sm:bottom-20 right-3 sm:right-6 z-20 flex items-center justify-center rounded bg-black/60 p-2 text-white transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-30",
          )}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      <div className="my-3 gap-3 px-4 lg:pr-4 lg:pl-0">
        <div
          className={cn(
            "w-px origin-top bg-border transition-transform duration-200",
            open ? "scale-y-100" : "scale-y-0",
          )}
        />

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild className="cursor-pointer">
            <button className="flex w-full max-w-4xl items-center gap-2 py-1 text-left group">
              <h2 className="text-base font-semibold leading-snug lg:text-lg">
                {unit.title}
              </h2>

              {hasDescription && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              )}
            </button>
          </CollapsibleTrigger>

          {hasDescription && (
            <CollapsibleContent>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground">
                {unit.description}
              </p>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    </div>
  );
}
