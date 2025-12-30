import { Skeleton } from "@/src/components/ui/skeleton";

export function StructureTreeSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" /> {/* "Course Structure" */}
        <Skeleton className="h-8 w-24 rounded-md" /> {/* Add Chapter button */}
      </div>

      {/* Chapters */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, chapterIndex) => (
          <div key={chapterIndex} className="rounded-md border p-3 space-y-3">
            {/* Chapter header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Chevron */}
                <Skeleton className="h-4 w-4 rounded-sm" />
                {/* Chapter title */}
                <Skeleton className="h-4 w-40" />
              </div>

              {/* Right-side actions */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-20 rounded-md" /> {/* Add Topic */}
                <Skeleton className="h-7 w-7 rounded-md" /> {/* More */}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2 pl-6">
              {Array.from({ length: 2 }).map((_, topicIndex) => (
                <Skeleton key={topicIndex} className="h-7 w-[85%] rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
