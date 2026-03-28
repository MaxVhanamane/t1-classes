import Image from "next/image";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

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
  const [open, setOpen] = useState(false);

  // No thumbnail configured
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        —
      </div>
    );
  }

  // Thumbnail configured but broken
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md bg-destructive/10 text-[10px] text-destructive">
        <span>Broken image</span>

        <button
          type="button"
          onClick={onFix}
          className="text-[10px] underline hover:opacity-80"
        >
          Fix thumbnail
        </button>
      </div>
    );
  }

  const thumbnail = (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      <Image
        src={src}
        alt={title}
        fill
        className="rounded-md object-cover"
        sizes="40px"
        onError={() => setFailed(true)}
      />
    </div>
  );

  if (!enableHoverPreview) {
    return thumbnail;
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div
          className="relative h-full w-full cursor-pointer"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {thumbnail}
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="center"
        sideOffset={12}
        className="hidden w-56 overflow-hidden rounded-md border bg-background p-0 shadow-lg md:block"
      >
        <div className="relative h-32 w-56 overflow-hidden rounded-md">
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            sizes="224px"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
