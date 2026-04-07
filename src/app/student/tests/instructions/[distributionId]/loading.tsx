import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function InstructionsPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Status card (optional placeholder, small) */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-56" />
        </CardContent>
      </Card>

      {/* General Instructions block */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[90%]" />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[85%]" />
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
