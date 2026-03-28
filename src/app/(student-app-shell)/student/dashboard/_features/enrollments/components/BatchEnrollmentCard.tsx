import { Link } from "@/src/components/ui/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { BatchEnrollment } from "../../../../../../api/my-enrollments/types";
import { formatDateShort } from "@/src/lib/date";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";

interface Props {
  enrollment: BatchEnrollment;
}

export function BatchEnrollmentCard({ enrollment }: Props) {
  const { batch, accessEndsAt } = enrollment;

  return (
    <Card className="flex h-72 flex-col transition hover:shadow-md py-5">
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2  font-semibold leading-snug">
            {batch.title}
          </h3>

          <Badge
            variant="secondary"
            className="shrink-0 px-2 py-0.5 text-[10px]"
          >
            Batch
          </Badge>
        </div>
        {/* Subtitle */}
        {batch.subtitle && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {batch.subtitle}
          </p>
        )}

        {/* Mode + Status */}
        <BatchMetaBadges batch={{ ...batch, is_active: true }} />

        <div className="flex justify-between">
          {batch.start_date && (
            <p className="text-xs text-muted-foreground">
              {new Date(batch.start_date) > new Date()
                ? `Batch starts on ${formatDateShort(batch.start_date)}`
                : `Batch started on ${formatDateShort(batch.start_date)}`}
            </p>
          )}
          {/* Access */}
          {accessEndsAt && (
            <p className="text-xs text-muted-foreground">
              Access till {formatDateShort(accessEndsAt)}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4">
        <Button asChild className="w-full">
          <Link href={`/learn/batches/${batch.id}`}>Go to Batch</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
