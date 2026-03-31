"use client";

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
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
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

            const isBatch = enrollment.target_type === "batch";

            const courseTitles =
              isBatch && batch
                ? batch.courses.map((c) => c.title)
                : course
                  ? [course.title]
                  : [];

            const primaryTitle = courseTitles[0];
            const extraCount = courseTitles.length - 1;

            const extraCoursesText =
              extraCount > 0 ? courseTitles.slice(1).join(", ") : null;

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
                  <Badge variant="secondary">{enrollment.target_type}</Badge>
                </TableCell>

                {/* ENROLLED IN */}
                <TableCell>
                  <div className="space-y-0.5">
                    {isBatch && batch ? (
                      <>
                        <TruncatedWithTooltip
                          text={batch.title}
                          className="font-medium"
                        />
                        {primaryTitle && (
                          <div className="text-xs text-muted-foreground">
                            <TruncatedWithTooltip
                              text={
                                extraCount > 0
                                  ? `${primaryTitle}, ${extraCoursesText}`
                                  : primaryTitle
                              }
                              className="max-w-65"
                            />
                          </div>
                        )}
                      </>
                    ) : course ? (
                      <TruncatedWithTooltip
                        text={course.title}
                        className="font-medium"
                      />
                    ) : (
                      <span className="text-destructive text-sm">
                        Missing target
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* GRANTED AS */}
                <TableCell>
                  <Badge variant="secondary">
                    {enrollment.enrollment_type}
                  </Badge>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <StatusBadge
                    status={enrollment.status}
                    isActive={enrollment.is_active}
                  />
                </TableCell>

                {/* REGISTERED VIA */}
                <TableCell>
                  <RegistrationChannelBadge
                    channel={enrollment.registration_channel}
                  />
                </TableCell>

                {/* ACCESS */}
                <TableCell className="text-sm">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">From</span>
                      <span className="font-sm text-foreground">
                        {format(
                          new Date(enrollment.access_starts_at),
                          "dd MMM yyyy, hh:mm a",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">To</span>
                      <span className="font-sm text-foreground">
                        {enrollment.access_ends_at
                          ? format(
                              new Date(enrollment.access_ends_at),
                              "dd MMM yyyy, hh:mm a",
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      className="cursor-pointer"
                      variant="outline"
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
