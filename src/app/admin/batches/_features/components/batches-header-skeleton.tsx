import { Skeleton } from "@/src/components/ui/skeleton";

export function BatchesHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
  );
}
