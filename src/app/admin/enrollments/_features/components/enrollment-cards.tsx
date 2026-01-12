import { Card, CardContent } from "@/src/components/ui/card";
import { EnrollmentRow } from "../types/enrollments";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import StatusBadge from "./status-badge";
import RegistrationChannelBadge from "./registration-channel-badge";
import { Badge } from "@/src/components/ui/badge";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";

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

        // ---- Target label logic (multi-course aware) ----
        let primaryTitle: string | null = null;
        let extraCoursesText: string | null = null;

        if (enrollment.target_type === "batch" && batch) {
          primaryTitle = batch.name;

          if (batch.courses.length > 0) {
            extraCoursesText = batch.courses.map((c) => c.title).join(", ");
          }
        }

        if (enrollment.target_type === "course" && course) {
          primaryTitle = course.title;
        }

        return (
          <Card key={enrollment.id}>
            <CardContent className="space-y-4 pt-4">
              {/* USER */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">User</div>
                {user ? (
                  <div>
                    <TruncatedWithTooltip
                      text={user.full_name}
                      className="font-medium"
                    />
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

              {/* TARGET TYPE */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Target type</div>
                <Badge variant="secondary">{enrollment.target_type}</Badge>
              </div>

              {/* ENROLLED IN */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Enrolled in</div>

                {primaryTitle ? (
                  <>
                    <TruncatedWithTooltip
                      text={primaryTitle}
                      className="font-medium"
                    />

                    {extraCoursesText && (
                      <TruncatedWithTooltip
                        text={extraCoursesText}
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-sm text-destructive">Missing target</div>
                )}
              </div>

              {/* ENROLLMENT STATUS */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Enrollment status
                </div>
                <StatusBadge
                  status={enrollment.status}
                  isActive={enrollment.is_active}
                />
              </div>

              {/* GRANTED AS */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Granted as</div>
                <Badge variant="secondary">{enrollment.enrollment_type}</Badge>
              </div>

              {/* REGISTRATION CHANNEL */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Registration channel
                </div>
                <RegistrationChannelBadge
                  channel={enrollment.registration_channel}
                />
              </div>

              {/* ACCESS PERIOD */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Access period
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

              {/* FOOTER */}
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
