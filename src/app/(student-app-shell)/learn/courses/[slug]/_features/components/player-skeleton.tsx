import { Skeleton } from "@/src/components/ui/skeleton";
import { Loader } from "lucide-react";

type Props = {
  hideTitleSekeleton?: boolean;
};

export function PlayerSkeleton({ hideTitleSekeleton = false }: Props) {
  return (
    <div className="flex h-full w-full flex-col relative">
      {/* Video */}
      <div className="relative aspect-video w-full dark:bg-muted-soft bg-muted lg:rounded-xl overflow-hidden">
        {/* shimmer */}
        <div className="absolute inset-0 animate-shimmer bg-muted/40" />

        {/* loader */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur">
            <Loader className="h-4 w-4 animate-spin text-foreground/70" />
            <span className="text-xs text-foreground/70">Loading video</span>
          </div>
        </div>
      </div>

      {/* Meta */}
      {!hideTitleSekeleton && (
        <div className="my-3 px-4 lg:pr-4 lg:pl-0">
          {/* Header row (collapsed state) */}
          <div className="flex w-full max-w-4xl items-center gap-2 py-1">
            {/* Title*/}
            <Skeleton className="h-5.5 lg:h-6.25 w-[70%] rounded bg-muted animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
