// Thumbnail Component (Single Source of Truth)

import Image from "next/image";
import { useState } from "react";

export function TableThumbnailPreview({
  src,
  title,
  onFix = () => {},
  enableHoverPreview = false,
}: {
  src?: string | null;
  title: string;
  onFix?: () => void;
  enableHoverPreview?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // No thumbnail configured
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground rounded-md">
        —
      </div>
    );
  }

  // Thumbnail configured but broken
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-destructive/10 text-[10px] text-destructive rounded-md">
        <span>Broken image</span>

        {onFix && (
          <button
            type="button"
            onClick={onFix}
            className="text-[10px] underline hover:opacity-80"
          >
            Fix thumbnail
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => enableHoverPreview && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover rounded-md"
        sizes="40px"
        onError={() => setFailed(true)}
      />

      {enableHoverPreview && hovered && (
        <div className="absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 md:block">
          <div className="relative h-32 w-56 overflow-hidden rounded-md border bg-background shadow-lg">
            <Image
              src={src}
              alt={title}
              fill
              className="object-cover"
              sizes="224px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
