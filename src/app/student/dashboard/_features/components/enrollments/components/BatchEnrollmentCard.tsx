import { Link } from "@/src/components/ui/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { BatchEnrollment } from "../../../../../../../lib/services/enrollments/types";
import { formatDateShort } from "@/src/lib/date";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { GrafanaBackground } from "@/src/components/ui/grafana-background";
import { getBatchLifecycle } from "@/src/lib/helper-functions/get-batch-lifecycle";
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Languages,
} from "lucide-react";

interface Props {
  enrollment: BatchEnrollment;
}

export function BatchEnrollmentCard({ enrollment }: Props) {
  const { batch, accessEndsAt } = enrollment;
  const lifecycle = getBatchLifecycle(batch);

  // Format the academic context based on the category
  const academicContext =
    batch.category === "boards" && batch.class_level && batch.board
      ? `Class ${batch.class_level} • ${batch.board.toUpperCase().replace("_", " ")}`
      : batch.target_exam
        ? batch.target_exam.toUpperCase().replace("_", " ")
        : batch.category.toUpperCase().replace("_", " ");

  return (
    <Card className="relative overflow-hidden flex h-74 flex-col py-3 rounded-xl transition bg-background group">
      {/* Subtle top light (main effect) */}
      <GrafanaBackground opacity={0.5} />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 
          bg-linear-to-b from-cyan-400/50 via-cyan-400/5 to-transparent 
          dark:from-cyan-300/50 dark:via-cyan-300/5 blur-2xl"
      />

      {/* Soft border glow (NO animation) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset 
          ring-cyan-400/10 dark:ring-cyan-300/15"
      />

      {/* Content */}
      <CardContent className="relative z-10 flex flex-1 flex-col gap-3 px-4 py-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[1.05rem] font-semibold leading-snug">
            {batch.title}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 px-2 py-0.5 text-[10px] bg-background/70 dark:bg-white/10 backdrop-blur-md"
          >
            Batch
          </Badge>
        </div>

        {/* Section (Using mt-2 instead of mt-auto) */}
        <div className="mt-2 flex flex-col gap-3.5">
          {/* Batch Metadata Grid */}
          <div className="flex flex-col gap-2.5">
            {/* Academic Context */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <GraduationCap className="size-3.5 text-muted-foreground" />
              <span className="truncate">{academicContext}</span>
            </div>

            {/* Subjects */}
            {batch.subjects && batch.subjects.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <BookOpen className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="line-clamp-1 capitalize">
                  {batch.subjects.join(", ").replace(/_/g, " ")}
                </span>
              </div>
            )}

            {/* Languages */}
            {batch.languages && batch.languages.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Languages className="size-3.5 text-muted-foreground" />
                <span className="capitalize">{batch.languages.join(", ")}</span>
              </div>
            )}

            {/* Batch Schedule (Start & End) */}
            {batch.start_date && batch.end_date && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {new Date(batch.start_date) > new Date()
                    ? "Starts"
                    : "Started"}{" "}
                  <span className="font-medium text-foreground/80">
                    {formatDateShort(batch.start_date)}
                  </span>
                  {" • "}
                  {new Date(batch.end_date) < new Date()
                    ? "Ended"
                    : "Ends"}{" "}
                  <span className="font-medium text-foreground/80">
                    {formatDateShort(batch.end_date)}
                  </span>
                </span>
              </div>
            )}

            {/* Access Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" />
              <span>
                {accessEndsAt
                  ? `Access till ${formatDateShort(accessEndsAt)}`
                  : "Lifetime access"}
              </span>
            </div>
          </div>

          {/* Mode + Status */}
          <div>
            <BatchMetaBadges
              batch={{ ...batch, is_active: true }}
              lifecycle={lifecycle}
            />
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="relative z-10 px-4">
        <Button asChild className="w-full">
          <Link href={`/student/learn/batches/${batch.id}`}>Go to Batch</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
