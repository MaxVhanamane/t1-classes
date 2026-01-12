import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { extractVimeoId } from "../helper-functions/video";
import { CourseUnitContent } from "../types/course-unit-content";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  unit: CourseUnitContent;
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
      start = `?start=${seconds}`;
    }
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}${start}` : "";
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

  const hasDescription = Boolean(unit.description);

  return (
    <div className="flex h-full flex-col">
      {/* Video */}
      <div className="relative aspect-video w-full bg-muted lg:rounded-xl">
        <iframe
          src={getEmbedUrl(unit)}
          className="absolute inset-0 h-full w-full  lg:rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Meta */}
      <div className="my-3 gap-3 px-4 lg:pr-4 lg:pl-0 ">
        {/* Vertical accent */}
        <div
          className={cn(
            "w-px origin-top bg-border transition-transform duration-200",
            open ? "scale-y-100" : "scale-y-0"
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
                    open && "rotate-180"
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
