"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { EnrollmentRow } from "../types/enrollments.types";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import StatusBadge from "./status-badge";
import RegistrationChannelBadge from "./registration-channel-badge";
import { Badge } from "@/src/components/ui/badge";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { deactivationReasonOptions } from "../zod-schema/enrollments";
import { useRouter } from "next/navigation";

type EnrollmentCardsProps = {
  enrollments: EnrollmentRow[];
  onEdit: (enrollment: EnrollmentRow) => void;
};

function getDeactivationReasonLabel(value?: string | null) {
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="text-right">{children}</div>
    </div>
  );
}

export function EnrollmentCards({ enrollments, onEdit }: EnrollmentCardsProps) {
  const router = useRouter();

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
        const { user, batch, course, financialOverview } = enrollment;

        const isBatch = enrollment.target_type === "batch";

        return (
          <Card key={enrollment.id}>
            <CardContent className="space-y-4 pt-5">
              {/* STUDENT */}
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Student
                </div>

                <div>
                  <TruncatedWithTooltip
                    text={user.full_name}
                    className="font-medium"
                  />

                  {user.phone && (
                    <div className="text-sm text-muted-foreground">
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t" />

              {/* TARGET TYPE */}
              <InfoRow label="Target">
                <Badge variant="outline">{enrollment.target_type}</Badge>
              </InfoRow>

              {/* ENROLLMENT */}
              <InfoRow label="Enrollment">
                {isBatch && batch ? (
                  <TruncatedWithTooltip
                    text={batch.title}
                    className="font-medium"
                  />
                ) : course ? (
                  <TruncatedWithTooltip
                    text={course.title}
                    className="font-medium"
                  />
                ) : (
                  <span className="text-sm text-destructive">
                    Missing target
                  </span>
                )}
              </InfoRow>

              {/* REGISTRATION CHANNEL */}
              <InfoRow label="Registration">
                <RegistrationChannelBadge
                  channel={enrollment.registration_channel}
                />
              </InfoRow>

              {/* STATUS */}
              <InfoRow label="Status">
                <div className="flex items-center justify-end gap-2">
                  <StatusBadge isActive={enrollment.is_active} />

                  {!enrollment.is_active && enrollment.deactivation_reason && (
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
              </InfoRow>

              {/* ACCESS STATUS */}
              <InfoRow label="Access Status">
                <AccessStatusBadge status={getAccessStatus(enrollment)} />
              </InfoRow>

              {/* STARTS */}
              <InfoRow label="Starts">
                <span className="text-sm font-medium">
                  {format(new Date(enrollment.access_starts_at), "dd MMM yyyy")}
                </span>
              </InfoRow>

              {/* ENDS */}
              <InfoRow label="Ends">
                <span className="text-sm font-medium">
                  {enrollment.access_ends_at
                    ? format(new Date(enrollment.access_ends_at), "dd MMM yyyy")
                    : "Unlimited"}
                </span>
              </InfoRow>

              <div className="border-t" />

              {/* FINANCIAL OVERVIEW */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Financial Overview
                </div>

                <InfoRow label="Fee Status">
                  {financialOverview ? (
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
                      {financialOverview.fee_status.replace("_", " ")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No fee plan</Badge>
                  )}
                </InfoRow>

                <InfoRow label="Final Fee">
                  <span className="font-medium">
                    {formatCurrency(financialOverview?.final_amount, {
                      emptyValue: "Not set",
                    })}
                  </span>
                </InfoRow>

                <InfoRow label="Paid">
                  <span className="font-medium">
                    {formatCurrency(financialOverview?.paid_amount ?? 0)}
                  </span>
                </InfoRow>

                <InfoRow label="Pending">
                  <span
                    className={cn(
                      "font-medium",
                      financialOverview?.pending_amount &&
                        financialOverview.pending_amount > 0 &&
                        "text-red-600 dark:text-red-400",
                    )}
                  >
                    {formatCurrency(financialOverview?.pending_amount, {
                      emptyValue: "Not set",
                    })}
                  </span>
                </InfoRow>

                <InfoRow label="Revisions">
                  <span className="font-medium">
                    {financialOverview ? (
                      financialOverview.superseded_count > 0 ? (
                        `${financialOverview.superseded_count} ${
                          financialOverview.superseded_count === 1
                            ? "revision"
                            : "revisions"
                        }`
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )
                    ) : (
                      "—"
                    )}
                  </span>
                </InfoRow>
              </div>

              <div className="border-t" />

              {/* CREATED */}
              <InfoRow label="Created">
                <span className="text-sm font-medium">
                  {format(new Date(enrollment.created_at), "dd MMM yyyy")}
                </span>
              </InfoRow>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => onEdit(enrollment)}
                >
                  Edit
                </Button>

                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() =>
                    router.push(`/admin/enrollments/${enrollment.id}/fees`)
                  }
                >
                  Fees
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
