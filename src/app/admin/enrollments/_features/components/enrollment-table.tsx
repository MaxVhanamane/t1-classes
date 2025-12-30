import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";
import { EnrollmentRow } from "../types/enrollments";
import { Button } from "@/src/components/ui/button";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";
import RegistrationChannelBadge from "./registration-channel-badge";
import StatusBadge from "./status-badge";
import { useRouter } from "next/navigation";

type EnrollmentTableProps = {
  enrollments: EnrollmentRow[];
  onEdit: (enrollment: EnrollmentRow) => void;
};

export function EnrollmentTable({ enrollments, onEdit }: EnrollmentTableProps) {
  const router = useRouter();
  if (enrollments.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground ">
        No enrollments found!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Target Type</TableHead>
            <TableHead>Enrolled In</TableHead>
            <TableHead>Granted As</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered Via</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {enrollments.map((enrollment) => {
            const user = enrollment.user;
            const batch = enrollment.batch;
            const course = enrollment.course;

            const targetLabel =
              enrollment.target_type === "batch"
                ? batch
                  ? `${batch.name}`
                  : "⚠ Missing batch"
                : course
                ? course.title
                : "⚠ Missing course";

            const subTargetLabel =
              enrollment.target_type === "batch"
                ? batch?.course?.title ?? null
                : null;

            return (
              <TableRow key={enrollment.id}>
                {/* USER */}
                <TableCell className="font-medium">
                  {user ? (
                    <div className="space-y-0.5">
                      <TruncatedWithTooltip text={user.full_name} />

                      {user.phone && (
                        <div className="text-xs text-muted-foreground">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-destructive text-sm">
                      Missing user
                    </span>
                  )}
                </TableCell>
                {/* TARGET TYPE */}
                <TableCell>
                  <div className="space-y-0.5">
                    <Badge variant="secondary">{enrollment.target_type}</Badge>
                  </div>
                </TableCell>

                {/* TARGET */}
                <TableCell>
                  <div className="space-y-0.5">
                    <TruncatedWithTooltip
                      text={targetLabel}
                      className="font-medium"
                    />

                    {subTargetLabel && (
                      <TruncatedWithTooltip
                        text={subTargetLabel}
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </div>
                </TableCell>

                {/* ENROLLMENT TYPE */}
                <TableCell>
                  <Badge variant="secondary">
                    {enrollment.enrollment_type}
                  </Badge>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={enrollment.status}
                      isActive={enrollment.is_active}
                    />
                  </div>
                </TableCell>
                {/* REGISTERED VIA */}

                <TableCell>
                  {enrollment.registration_channel ? (
                    <RegistrationChannelBadge
                      channel={enrollment.registration_channel}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* ACCESS */}
                <TableCell className="text-sm">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">From</span>
                      <span className="font-medium text-foreground">
                        {format(
                          new Date(enrollment.access_starts_at),
                          "dd MMM yyyy"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">To</span>
                      <span className="font-medium text-foreground">
                        {enrollment.access_ends_at
                          ? format(
                              new Date(enrollment.access_ends_at),
                              "dd MMM yyyy"
                            )
                          : "Unlimited"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* ENROLLED AT */}
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(enrollment.enrolled_at), "dd MMM yyyy")}
                </TableCell>
                {/* ACTIONS */}
                <TableCell className="text-left">
                  <div className="flex items-center justify-start gap-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                      onClick={() => onEdit(enrollment)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/enrollments/${enrollment.id}/fees`)
                      }
                    >
                      Fee Plan
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
