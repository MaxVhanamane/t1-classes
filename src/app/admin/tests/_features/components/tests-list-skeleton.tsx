import { cn } from "@/src/lib/utils";

interface Props {
  count?: number;
  className?: string;
  actionVariant?: "tests" | "schedule";
}

export function TestsListSkeleton({
  count = 4,
  className,
  actionVariant = "tests",
}: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-lg border p-4 shadow-sm"
        >
          {/* === GROUP 1: HEADER === */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-3/4 max-w-60 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
            </div>
          </div>

          {/* === GROUP 2: METADATA & ACTIONS === */}
          <div className="flex flex-col gap-2.5">
            {/* 1. Stats Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
            </div>

            {/* 2. Subjects List */}
            <div className="h-3 w-48 animate-pulse rounded-md bg-muted" />

            {/* 3. Dates & Actions Row */}
            <div className="flex flex-col gap-3 sm:-mt-1 sm:flex-row sm:items-center sm:justify-between">
              {/* Left Side (Dates & Author) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
                <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
                <div className="hidden h-3 w-28 animate-pulse rounded-md bg-muted sm:block" />
              </div>

              {/* Right Side (Actions) wraps to right on mobile */}
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                {actionVariant === "schedule" ? (
                  // Schedule Button matches h-8 text line height
                  <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                ) : (
                  // Edit/Delete Buttons (size-8 instead of size-9)
                  <>
                    <div className="size-8 animate-pulse rounded-md bg-muted" />
                    <div className="size-8 animate-pulse rounded-md bg-muted" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
