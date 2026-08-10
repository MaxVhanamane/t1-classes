"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { format } from "date-fns";
import { LeadRow, LEAD_STATUS_LABELS } from "../types/lead.types";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";
import {
  GraduationCap,
  Users,
  CalendarClock,
  Globe,
  Phone,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type LeadsTableProps = {
  leads: LeadRow[];
  onEdit: (lead: LeadRow) => void;
};

function LeadStatusBadge({ status }: { status: LeadRow["status"] }) {
  const styles: Record<LeadRow["status"], string> = {
    new: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    attempting_contact:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    in_progress:
      "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    enrolled:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    not_interested:
      "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    invalid: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        styles[status],
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

// Updated Target Badge for clarity
function TargetBadge({
  course,
  batch,
}: {
  course: LeadRow["course"];
  batch: LeadRow["batch"];
}) {
  if (batch) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1 rounded-sm border border-cyan-200 bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:border-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
          <Users className="size-3" />
          Batch
        </span>
        <span className="text-sm font-medium">
          <TruncatedWithTooltip text={batch.name} className="max-w-[140px]" />
        </span>
      </div>
    );
  }

  if (course) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1 rounded-sm border border-indigo-200 bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
          <GraduationCap className="size-3" />
          Course
        </span>
        <span className="text-sm font-medium">
          <TruncatedWithTooltip text={course.title} className="max-w-[140px]" />
        </span>
      </div>
    );
  }

  return <span className="text-sm text-muted-foreground">General Inquiry</span>;
}

export function LeadsTable({ leads, onEdit }: LeadsTableProps) {
  if (leads.length === 0) {
    return null;
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
              <TableHead className="sticky left-16 z-20 min-w-[200px] bg-secondary font-medium shadow-[inset_-1px_0_0_0_var(--border-50)]">
                Lead Info
              </TableHead>

              <TableHead className="min-w-[180px]">Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Handled By</TableHead>
              <TableHead>Created</TableHead>

              <TableHead className="sticky right-0 z-20 w-24 bg-secondary text-center font-medium shadow-[inset_1px_0_0_0_var(--border-50)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leads.map((lead, index) => {
              return (
                <TableRow
                  key={lead.id}
                  className="group transition-colors hover:bg-muted-subtle"
                >
                  {/* NO. */}
                  <TableCell
                    className="sticky left-0 z-20 w-16 text-center bg-card font-semibold 
                    transition-colors group-hover:bg-muted-subtle 
                    shadow-[inset_-1px_0_0_0_var(--border-50)]"
                  >
                    {index + 1}
                  </TableCell>

                  {/* LEAD INFO */}
                  <TableCell
                    className="sticky left-16 z-20 bg-card 
                    transition-colors group-hover:bg-muted-subtle 
                    shadow-[inset_-1px_0_0_0_var(--border-50)]"
                  >
                    <div className="space-y-1.5">
                      <TruncatedWithTooltip
                        text={lead.name}
                        className="font-medium"
                      />

                      <div className="flex flex-col items-start gap-1">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-secondary/60 px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Click to call"
                        >
                          <Phone className="size-3 text-muted-foreground" />
                          {lead.phone}
                        </a>

                        {lead.email && (
                          <span className="text-xs text-muted-foreground truncate w-full max-w-[180px]">
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* TARGET */}
                  <TableCell>
                    <TargetBadge course={lead.course} batch={lead.batch} />
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>

                  {/* NEXT FOLLOW UP */}
                  <TableCell>
                    {lead.next_follow_up_at ? (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <CalendarClock className="size-4 text-muted-foreground" />
                        {format(
                          new Date(lead.next_follow_up_at),
                          "dd MMM, h:mm a",
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* SOURCE */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe className="size-3.5" />
                      <span className="capitalize">
                        {lead.source.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>

                  {/* HANDLED BY */}
                  <TableCell>
                    {lead.updated_by_user ? (
                      <TruncatedWithTooltip
                        text={lead.updated_by_user.full_name}
                        className="text-sm max-w-[120px]"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>

                  {/* CREATED */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(lead.created_at), "dd MMM yyyy")}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="sticky right-0 z-20 text-center bg-card font-semibold transition-colors group-hover:bg-muted-subtle shadow-[inset_1px_0_0_0_var(--border-50)]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onEdit(lead)}
                    >
                      Update
                    </Button>
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
