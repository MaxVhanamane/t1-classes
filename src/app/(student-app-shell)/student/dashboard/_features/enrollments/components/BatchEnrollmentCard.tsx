import Link from "next/link";
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
    <Card className="flex h-72 flex-col transition hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[1.05rem] font-semibold leading-snug">
            {batch.name}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 px-2 py-0.5 text-[10px]"
          >
            Batch
          </Badge>
        </div>

        {/* Mode + Status */}
        <BatchMetaBadges mode={batch.mode} status={batch.status} />

        {/* Access */}
        {accessEndsAt && (
          <p className="text-xs text-muted-foreground">
            Access till {formatDateShort(accessEndsAt)}
          </p>
        )}

        {/* Included courses */}
        {batch.courses.length > 0 ? (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Included courses
            </p>
            <div className="flex flex-wrap gap-1">
              {batch.courses.map((course) => (
                <Badge key={course.id} variant="outline" className="text-xs">
                  {course.title}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Course content will be available soon.
          </p>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-2">
        <Button asChild className="w-full">
          <Link href={`/batches/${batch.id}`}>Go to Batch</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
