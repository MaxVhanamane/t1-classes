import { Skeleton } from "@/src/components/ui/skeleton";

export default function FeePageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-7 w-16" />
      </div>

      {/* Fee Plan Summary */}
      <div className="w-full max-w-sm rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Amount rows */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Final amount */}
          <div className="rounded-lg bg-muted/50 px-4 py-4 space-y-2 text-center">
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-8 w-32 mx-auto" />
          </div>

          {/* Meta */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Notes */}
          <div className="border-t pt-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Audit */}
          <div className="border-t pt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Payments Section */}
      <div className="space-y-4 lg:max-w-xl">
        <Skeleton className="h-4 w-24" />

        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-9 w-40" />

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Fee Plan History */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />

        <div className="rounded-lg border lg:max-w-xl divide-y">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
