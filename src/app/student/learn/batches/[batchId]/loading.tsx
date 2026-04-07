import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function BatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        {/* Header */}
        <header className="mb-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </section>
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="flex h-110 flex-col overflow-hidden bg-background gap-0 p-0">
      {/* Image */}
      <div className="px-3 pt-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <Skeleton className="h-full w-full" />
          <div className="absolute left-3 top-3">
            <Skeleton className="h-4 w-16 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-0">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />

        {/* subtitle */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />

        {/* meta */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-[60%]" />
          <Skeleton className="h-3 w-[50%]" />
        </div>

        {/* badges */}
        <div className="flex gap-1 flex-wrap">
          <Skeleton className="h-4 w-10 rounded-sm" />
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-4 w-8 rounded-sm" />
        </div>

        {/* description */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-[80%]" />
        </div>

        <div className="flex-1" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
