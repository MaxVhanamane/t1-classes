import { Skeleton } from "@/src/components/ui/skeleton";
import { Loader } from "lucide-react";

export default function LoadingCoursePlayer() {
  return (
    <div className="flex w-full flex-col lg:flex-row lg:px-7 lg:pr-119 pb-36">
      {/* ================= LEFT ================= */}
      <div className="flex flex-col lg:flex-1">
        <div className="sticky top-14 z-20 bg-background lg:static lg:mt-3">
          <div className="flex w-full flex-col space-y-4">
            {/* Video */}
            <div className="relative aspect-video w-full overflow-hidden rounded-none bg-muted dark:bg-muted-soft lg:rounded-xl">
              {/* shimmer */}
              <div className="absolute inset-0 animate-shimmer bg-muted/40" />

              {/* loader */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur">
                  <Loader className="h-4 w-4 animate-spin text-foreground/70" />

                  <span className="text-xs text-foreground/70">
                    Main loader Preparing your content...
                  </span>
                </div>
              </div>
            </div>

            {/* Video meta (same spacing + height) */}
            <div className="space-y-2 px-4 lg:pr-4 lg:pl-0">
              <Skeleton className="h-5.5 lg:h-6.25 w-[70%]  max-w-4xl rounded" />
            </div>
          </div>
        </div>

        {/* ================= MOBILE STRUCTURE ================= */}
        <div className="lg:hidden mt-3 border-t">
          {/* Mobile — toggle bar skeleton */}
          <div className="px-4 flex justify-between items-center border-t border-b py-2">
            <Skeleton className="h-4 w-28 rounded-md" />

            <div className="flex rounded-lg border p-1 gap-1">
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          </div>
          <div className="space-y-4 p-3">
            {Array.from({ length: 2 }).map((_, chapterIdx) => (
              <div
                key={chapterIdx}
                className="border rounded-sm bg-muted/30 overflow-hidden"
              >
                {/* Chapter */}
                <div className="px-4 py-5">
                  <Skeleton className="h-4 w-4/5" />
                </div>

                <div className="border-t p-3 space-y-3">
                  {Array.from({ length: 2 }).map((_, topicIdx) => (
                    <div
                      key={topicIdx}
                      className="border rounded-sm bg-background overflow-hidden"
                    >
                      {/* Topic */}
                      <div className="px-4 py-3 space-y-1">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>

                      {/* Units */}
                      <div className="px-4 pb-3 space-y-1">
                        {Array.from({ length: 2 }).map((_, unitIdx) => (
                          <div
                            key={unitIdx}
                            className="flex items-center gap-2 px-2 py-2"
                          >
                            <Skeleton className="h-4 w-4 rounded-sm" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= DESKTOP STRUCTURE ================= */}
      <aside className="hidden lg:block">
        <div className="fixed top-14 right-7 w-md h-screen bg-background">
          <div className="h-[calc(100vh-56px)] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 shrink-0">
              <Skeleton className="h-6 w-40" />
            </div>

            {/* Structure */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, chapterIdx) => (
                <div
                  key={chapterIdx}
                  className="border rounded-sm bg-muted/30 overflow-hidden"
                >
                  <div className="px-4 py-6">
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="border-t p-3 space-y-3">
                    {Array.from({ length: 2 }).map((_, topicIdx) => (
                      <div
                        key={topicIdx}
                        className="border rounded-sm bg-background overflow-hidden"
                      >
                        <div className="px-4 py-3 space-y-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>

                        <div className="px-4 pb-3 space-y-1">
                          {Array.from({ length: 2 }).map((_, unitIdx) => (
                            <div
                              key={unitIdx}
                              className="flex items-center gap-2 px-2 py-2"
                            >
                              <Skeleton className="h-4 w-4 rounded-sm" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
