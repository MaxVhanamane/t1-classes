import { cn } from "@/src/lib/utils";

interface Props {
  count?: number;
  className?: string;
}

export function TestsListSkeleton({ count = 4, className }: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 rounded-lg border p-4 shadow-sm"
        >
          {/* LEFT CONTENT */}
          <div className="min-w-0 flex-1 flex flex-col">
            {/* --- HEADER GROUP --- */}
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-3/4 max-w-60 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
              </div>
            </div>

            {/* --- DETAILS GROUP (Matches your gap-2 spacing) --- */}
            <div className="flex flex-col gap-2">
              {/* 1. Stats Row (Sections, Questions, Marks) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
              </div>

              {/* 2. Subjects List */}
              <div className="h-3 w-48 animate-pulse rounded-md bg-muted" />

              {/* 3. Created Dates & Author */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS (Buttons) */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="size-9 animate-pulse rounded-md bg-muted" />
            <div className="size-9 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
