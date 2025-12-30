import { Skeleton } from "@/src/components/ui/skeleton";

export function BatchesTableSkeleton() {
  return (
    <div className="hidden md:block border rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {Array.from({ length: 6 }).map((_, row) => (
        <div
          key={row}
          className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0"
        >
          {Array.from({ length: 8 }).map((_, col) => (
            <Skeleton key={col} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
