import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {/* ---------------------------------- */}
      {/* Header Card */}
      {/* ---------------------------------- */}
      <Card className="relative overflow-hidden border-none rounded-sm">
        <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 sm:h-10 w-48 sm:w-72 rounded-xl" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-lg" />
            </div>
          </div>

          <Skeleton className="h-8 w-32 rounded-full" />
        </CardHeader>
      </Card>

      {/* ---------------------------------- */}
      {/* Score Card */}
      {/* ---------------------------------- */}
      <Card className="border-none rounded-sm">
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* Marks */}
            <div className="flex items-center gap-5">
              <Skeleton className="size-16 rounded-2xl" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>

            {/* Rank */}
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-2xl" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-lg" />
              </div>

              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>

            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------- */}
      {/* Stats Skeleton */}
      {/* ---------------------------------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 auto-rows-fr">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none h-full rounded-sm">
            <CardContent className="p-5 flex h-full flex-col justify-between">
              {/* Top */}
              <div className="flex items-center justify-between">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-7 w-10 rounded-lg" />
              </div>

              {/* Bottom */}
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------------------------------- */}
      {/* CTA Card */}
      {/* ---------------------------------- */}
      <Card className="border-none rounded-sm">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
          <Skeleton className="h-8 w-full sm:w-80 rounded-sm" />

          <Skeleton className="h-11 w-52 rounded-sm" />
        </CardContent>
      </Card>
    </div>
  );
}
