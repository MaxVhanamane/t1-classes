import { Card } from "@/src/components/ui/card";

import { Skeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted-soft p-4">
      <Card className="w-full max-w-6xl rounded-3xl border bg-card p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_420px]">
          <Skeleton className="aspect-video w-full rounded-3xl" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-52 rounded-xl" />

            <Skeleton className="h-20 w-full rounded-2xl" />

            <Skeleton className="h-14 w-full rounded-2xl" />

            <Skeleton className="h-14 w-full rounded-2xl" />

            <Skeleton className="h-14 w-full rounded-2xl" />

            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </Card>
    </div>
  );
}
