import { Skeleton } from "@/src/components/ui/skeleton";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  showTableHeader?: boolean;
  className?: string;
};

export function TableSkeleton({
  rows = 6,
  columns = 8,
  showTableHeader = true,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`hidden md:block border rounded-lg overflow-hidden ${className}`}
    >
      {showTableHeader && (
        <div
          className="grid gap-4 p-4 border-b bg-muted"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-4 p-4 border-b last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
