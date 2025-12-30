import { Card, CardContent } from "@/src/components/ui/card";
import { EnrollmentRow } from "../types/enrollments";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import StatusBadge from "./status-badge";
import RegistrationChannelBadge from "./registration-channel-badge";
import { Badge } from "@/src/components/ui/badge";

type EnrollmentCardsProps = {
  enrollments: EnrollmentRow[];
  onEdit: (enrollment: EnrollmentRow) => void;
};
export function EnrollmentCards({ enrollments, onEdit }: EnrollmentCardsProps) {
  if (enrollments.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No enrollments found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => {
        const user = enrollment.user;
        const batch = enrollment.batch;
        const course = enrollment.course;

        const targetLabel =
          enrollment.target_type === "batch"
            ? batch
              ? batch.name
              : "⚠ Missing batch"
            : course
            ? course.title
            : "⚠ Missing course";

        const subTargetLabel =
          enrollment.target_type === "batch"
            ? batch?.course?.title ?? null
            : null;

        return (
          <Card key={enrollment.id}>
            <CardContent className="space-y-4 pt-4">
              {/* USER */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">User</div>
                {user ? (
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    {user.phone && (
                      <div className="text-xs text-muted-foreground">
                        {user.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-destructive">Missing user</div>
                )}
              </div>

              {/* Target TYPE */}
              <div className="space-y-1 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Target type</div>
                <Badge variant="secondary">{enrollment.target_type}</Badge>
              </div>

              {/* TARGET */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Enrolled In</div>

                <div className="font-medium">{targetLabel}</div>

                {subTargetLabel && (
                  <div className="text-xs text-muted-foreground">
                    {subTargetLabel}
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="space-y-1 flex gap-2 items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Enrollment Status
                </div>
                <StatusBadge
                  status={enrollment.status}
                  isActive={enrollment.is_active}
                />
              </div>

              {/* Granted As */}
              <div className="space-y-1 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Granted As</div>
                <Badge variant="secondary">{enrollment.enrollment_type}</Badge>
              </div>

              {/* REGISTRATION CHANNEL */}
              <div className="space-y-1 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Registration Channel
                </div>
                <RegistrationChannelBadge
                  channel={enrollment.registration_channel}
                />
              </div>

              {/* ACCESS PERIOD */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Access Period
                </div>
                <div className="text-sm">
                  <span className="font-medium">
                    {format(
                      new Date(enrollment.access_starts_at),
                      "dd MMM yyyy"
                    )}
                  </span>
                  <span className="mx-1 text-muted-foreground">→</span>
                  <span className="font-medium">
                    {enrollment.access_ends_at
                      ? format(
                          new Date(enrollment.access_ends_at),
                          "dd MMM yyyy"
                        )
                      : "Unlimited"}
                  </span>
                </div>
              </div>

              {/* ENROLLED AT + ACTION */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Enrolled on{" "}
                  {format(new Date(enrollment.enrolled_at), "dd MMM yyyy")}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(enrollment)}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
