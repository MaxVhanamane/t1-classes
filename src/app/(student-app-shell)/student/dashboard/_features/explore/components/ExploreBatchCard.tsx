import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { ExploreBatch } from "../types";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { formatDateShort } from "@/src/lib/date";

export function ExploreBatchCard({ batch }: { batch: ExploreBatch }) {
  return (
    <Card className="flex h-96 flex-col transition hover:shadow-md">
      {/* CONTENT */}
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-4">
        {/* TITLE */}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {batch.name}
        </h3>

        {/* MODE + STATUS */}
        <BatchMetaBadges mode={batch.mode} status={batch.status} />

        {/* DATE / DURATION */}
        <div className="text-xs text-muted-foreground">
          {batch.start_date && (
            <span>Starts {formatDateShort(batch.start_date)}</span>
          )}
          {batch.duration && (
            <span className="ml-2">• {batch.duration} days</span>
          )}
        </div>

        {/* COURSE COUNT */}
        <Badge variant="outline" className="w-fit text-xs">
          {batch.course_count} courses included
        </Badge>

        {/* DESCRIPTION — HARD LIMITED */}
        <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">
          {batch.description ?? " "}
        </p>
      </CardContent>

      {/* FOOTER — FIXED POSITION */}
      <CardFooter className="mt-auto px-4 pb-4 pt-2">
        <Button asChild className="w-full" disabled={!batch.admission_open}>
          <Link href={`/batches/${batch.id}`}>
            {batch.admission_open ? "View Batch" : "Admissions Closed"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
