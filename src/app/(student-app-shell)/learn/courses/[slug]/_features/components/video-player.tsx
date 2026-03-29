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
  lock?: (orientation: string) => Promise<void>;
};

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return "";
  const parsed = new URL(url);
  const videoId = parsed.searchParams.get("v");
  const timeParam = parsed.searchParams.get("t");
  let start = "";
  if (timeParam) {
    const seconds = parseInt(timeParam.replace("s", ""), 10);
    if (!isNaN(seconds)) {
      start = `&start=${seconds}`;
    }
  }
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&controls=1&iv_load_policy=3&color=white${start}`
    : "";
}

function getEmbedUrl(unit: Props["unit"]) {
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

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const handleFullscreen = async () => {
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
    } catch {
      // Orientation lock may be denied on some devices
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Video */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full bg-muted lg:rounded-xl"
      >
        <iframe
          src={getEmbedUrl(unit)}
          className="absolute inset-0 h-full w-full lg:rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={handleFullscreen}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="absolute bottom-1/2 right-2 z-10 flex items-center justify-center rounded bg-black/60 p-1.5 text-white"
        >
          {isFullscreen ? (
            <Minimize size={18} color="white" />
          ) : (
            <Maximize size={18} color="white" />
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="my-3 gap-3 px-4 lg:pr-4 lg:pl-0 ">
        {/* Vertical accent */}
        <div
          className={cn(
            "w-px origin-top bg-border transition-transform duration-200",
            open ? "scale-y-100" : "scale-y-0",
          )}
        />

        {/* Content */}
        <Collapsible open={open} onOpenChange={setOpen}>
          {/* Header */}
          <CollapsibleTrigger asChild className="cursor-pointer">
            <button className="flex w-full max-w-4xl items-center  gap-2 py-1 text-left group">
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

          {/* Description */}
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
