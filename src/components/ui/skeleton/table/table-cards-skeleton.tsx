import { Skeleton } from "@/src/components/ui/skeleton";

type CardSkeletonProps = {
  cards?: number;
  extraFields?: number;
  className?: string;
};

const FIELD_WIDTHS = ["w-full", "w-5/6", "w-4/5", "w-3/4"];

export function CardSkeleton({
  cards = 4,
  extraFields = 0,
  className = "",
}: CardSkeletonProps) {
  return (
    <div className={`md:hidden space-y-4 ${className}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-2/3" />

          {/* Subtitle */}
          <Skeleton className="h-4 w-1/2" />

          {/* Pills / tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Default fields */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/3" />

          {/*  Extra vertical fields with variable widths */}
          {Array.from({ length: extraFields }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={`h-4 ${FIELD_WIDTHS[(i + idx) % FIELD_WIDTHS.length]}`}
            />
          ))}

          {/* Action button */}
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
