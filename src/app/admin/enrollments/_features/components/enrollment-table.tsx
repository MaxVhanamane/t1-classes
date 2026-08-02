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
import { EnrollmentRow } from "../types/enrollments.types";
import { Button } from "@/src/components/ui/button";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";
import RegistrationChannelBadge from "./registration-channel-badge";
import StatusBadge from "./status-badge";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { GraduationCap, Info, Users } from "lucide-react";
import { deactivationReasonOptions } from "../zod-schema/enrollments";
import { cn } from "@/src/lib/utils";

type EnrollmentTableProps = {
  enrollments: EnrollmentRow[];

  onEdit: (enrollment: EnrollmentRow) => void;
};

function getAccessStatus(
  enrollment: EnrollmentRow,
): "ongoing" | "upcoming" | "ended" {
  const now = new Date();

  const startsAt = new Date(enrollment.access_starts_at);

  const endsAt = enrollment.access_ends_at
    ? new Date(enrollment.access_ends_at)
    : null;

  if (startsAt > now) {
    return "upcoming";
  }

  if (endsAt && endsAt < now) {
    return "ended";
  }

  return "ongoing";
}

function AccessStatusBadge({
  status,
}: {
  status: "ongoing" | "upcoming" | "ended";
}) {
  const styles = {
    ongoing:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",

    upcoming:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",

    ended:
      "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-300",
  };

  const labels = {
    ongoing: "Ongoing",
    upcoming: "Upcoming",
    ended: "Ended",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

export function getDeactivationReasonLabel(value?: string | null) {
  return (
    deactivationReasonOptions.find((option) => option.value === value)?.label ??
    "Unknown reason"
  );
}

function formatCurrency(
  value: number | null | undefined,
  options?: {
    emptyValue?: string;
  },
) {
  if (value === null || value === undefined) {
    return options?.emptyValue ?? "N/A";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function TargetBadge({ type }: { type: "batch" | "course" }) {
  if (type === "batch") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
        <Users className="size-3.5" />
        Batch
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/15 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
      <GraduationCap className="size-3.5" />
      Course
    </span>
  );
}

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
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_-1px_0_0_0_var(--border-50)]">
                No.
              </TableHead>
              <TableHead>Student</TableHead>

              <TableHead>Target</TableHead>

              <TableHead>Enrollment</TableHead>
              <TableHead>Registration channel</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Access Status</TableHead>

              <TableHead>Starts</TableHead>

              <TableHead>Ends</TableHead>

              <TableHead>Fee Status</TableHead>

              <TableHead className="text-center">Final Fee</TableHead>

              <TableHead className="text-center">Paid</TableHead>

              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Revisions</TableHead>
              <TableHead className="text-center">Overpaid</TableHead>
              <TableHead>Created</TableHead>

              <TableHead className="sticky right-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_1px_0_0_0_var(--border-50)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {enrollments.map((enrollment, index) => {
              const { user, batch, course, financialOverview } = enrollment;

              const isBatch = enrollment.target_type === "batch";

              return (
                <TableRow
                  key={enrollment.id}
                  className="group transition-colors hover:bg-muted-subtle"
                >
                  {/* STUDENT */}
                  <TableCell
                    className="sticky left-0 z-20 w-16 text-center bg-card font-semibold
             transition-colors group-hover:bg-muted-subtle
             shadow-[inset_-1px_0_0_0_var(--border-50)]"
                  >
                    {index + 1}
                  </TableCell>
                  {/* STUDENT */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <TruncatedWithTooltip text={user.full_name} />

                      {user.phone && (
                        <div className="text-xs text-muted-foreground">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* TARGET */}
                  <TableCell>
                    <TargetBadge type={enrollment.target_type} />
                  </TableCell>
                  {/* ENROLLMENT */}
                  <TableCell>
                    {isBatch && batch ? (
                      <div className="space-y-1">
                        <TruncatedWithTooltip
                          text={batch.title}
                          className="font-medium"
                        />
                      </div>
                    ) : course ? (
                      <div className="space-y-1">
                        <TruncatedWithTooltip
                          text={course.title}
                          className="font-medium"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-destructive">
                        Missing target
                      </span>
                    )}
                  </TableCell>

                  {/* Registration channel */}
                  <TableCell>
                    <RegistrationChannelBadge
                      channel={enrollment.registration_channel}
                    />
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge isActive={enrollment.is_active} />

                      {!enrollment.is_active &&
                        enrollment.deactivation_reason && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>

                              <TooltipContent className="max-w-xs text-sm">
                                {getDeactivationReasonLabel(
                                  enrollment.deactivation_reason,
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                  </TableCell>

                  {/* ACCESS */}
                  <TableCell>
                    <AccessStatusBadge status={getAccessStatus(enrollment)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(
                      new Date(enrollment.access_starts_at),
                      "dd MMM yyyy",
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enrollment.access_ends_at
                      ? format(
                          new Date(enrollment.access_ends_at),
                          "dd MMM yyyy",
                        )
                      : "Unlimited"}
                  </TableCell>
                  {/* FEE STATUS */}
                  <TableCell>
                    {financialOverview ? (
                      <div className="space-y-1">
                        <Badge
                          variant={
                            financialOverview.fee_status === "paid"
                              ? "success"
                              : financialOverview.fee_status === "pending"
                                ? "secondary"
                                : financialOverview.fee_status === "overpaid"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {financialOverview.fee_status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline">No fee plan</Badge>
                    )}
                  </TableCell>

                  {/* FINAL */}
                  <TableCell className="text-center font-medium">
                    {formatCurrency(financialOverview?.final_amount, {
                      emptyValue: "Not set",
                    })}
                  </TableCell>

                  {/* PAID */}
                  <TableCell className="text-center">
                    {formatCurrency(financialOverview?.paid_amount ?? 0)}
                  </TableCell>

                  {/* PENDING */}
                  <TableCell
                    className={cn(
                      financialOverview?.pending_amount === 0
                        ? "text-center text-muted-foreground"
                        : financialOverview?.pending_amount &&
                            financialOverview.pending_amount > 0
                          ? "text-right font-medium text-red-500"
                          : "text-right",
                    )}
                  >
                    {formatCurrency(financialOverview?.pending_amount, {
                      emptyValue: "Not set",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {financialOverview ? (
                      financialOverview.superseded_count > 0 ? (
                        <span className="font-medium">
                          {financialOverview.superseded_count}{" "}
                          {financialOverview.superseded_count === 1
                            ? "revision"
                            : "revisions"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center",
                      financialOverview?.overpaid_amount &&
                        financialOverview.overpaid_amount > 0 &&
                        "font-medium text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {formatCurrency(financialOverview?.overpaid_amount ?? 0)}
                  </TableCell>

                  {/* CREATED */}
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(enrollment.created_at), "dd MMM yyyy")}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="sticky right-0 z-20 text-center bg-card font-semibold transition-colors group-hover:bg-muted-subtle shadow-[inset_1px_0_0_0_var(--border-50)]">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onEdit(enrollment)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/admin/enrollments/${enrollment.id}/fees`,
                          )
                        }
                      >
                        Fees
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
