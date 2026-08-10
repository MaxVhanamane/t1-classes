"use client";

import { AlertCircle, IndianRupee, Users, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useBatchFinancials } from "../hooks/use-batch-financials";

import { cn } from "@/src/lib/utils";
import { RichPopover } from "@/src/components/ui/common/rich-popover";

export function BatchFinancialsTable() {
  const { data: batches, isLoading, isError } = useBatchFinancials();

  if (isError) {
    return (
      <Card className="col-span-1 flex h-[400px] items-center justify-center rounded-xl border bg-card shadow-sm md:col-span-2">
        <p className="text-sm text-muted-foreground">
          Failed to load batch financial summary.
        </p>
      </Card>
    );
  }

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="col-span-1 rounded-xl border bg-card shadow-none md:col-span-2 gap-0">
      <CardHeader className="pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            Batch Financial Overview
          </CardTitle>
          <CardDescription>
            Collection progress and pending dues across all active batches.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-0 sm:px-6 pb-6">
        {isLoading ? (
          <div className="px-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !batches || batches.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No active batches found.
          </div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-semibold px-4 w-[320px]">
                    Batch & Enrollment
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Expected
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Collected
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Pending
                  </TableHead>
                  <TableHead className="font-semibold px-4 w-[160px]">
                    Collection Rate
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const collectionPct =
                    batch.total_expected > 0
                      ? Math.min(
                          100,
                          (batch.total_collected / batch.total_expected) * 100,
                        )
                      : 0;

                  const hasMissingPlans = batch.missing_fee_plan_students > 0;

                  return (
                    <TableRow
                      key={batch.batch_id}
                      className="group hover:bg-muted/20"
                    >
                      {/* Batch & Enrollment Info */}
                      <TableCell className="px-4 py-3 align-middle">
                        <div className="flex flex-col gap-1.5 min-w-0 max-w-[280px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-foreground text-sm truncate flex-1">
                              {batch.batch_title}
                            </span>
                            <RichPopover
                              color={hasMissingPlans ? "amber" : "indigo"}
                              badgeText="Stats"
                              title="Student Breakdown"
                              icon={<Users className="h-4 w-4" />}
                              trigger={
                                <button className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              }
                            >
                              <div className="mt-3 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    Total Students:
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {batch.total_students}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    Complete Fee Paid:
                                  </span>
                                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {batch.fully_paid_students}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    Pending Fees:
                                  </span>
                                  <span className="font-medium text-rose-500 dark:text-rose-400">
                                    {batch.pending_students}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    Without Fee Plan:
                                  </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      hasMissingPlans
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-foreground",
                                    )}
                                  >
                                    {batch.missing_fee_plan_students}
                                  </span>
                                </div>

                                {hasMissingPlans && (
                                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 flex gap-2 items-start">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                      <strong>Warning:</strong> Active students
                                      must have a fee plan. Unassigned students
                                      cannot be billed or tracked.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </RichPopover>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center text-xs text-muted-foreground font-medium">
                              <Users className="mr-1 h-3 w-3" />
                              {batch.total_students} Total
                            </span>
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              {batch.fully_paid_students} Paid
                            </span>
                            <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                              {batch.pending_students} Pending
                            </span>
                          </div>

                          {hasMissingPlans && (
                            <Badge
                              variant="outline"
                              className="w-fit mt-0.5 bg-amber-500/10 text-amber-600 border-0 h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider dark:text-amber-400"
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {batch.missing_fee_plan_students} Missing Plan
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Expected */}
                      <TableCell className="text-right align-middle text-sm font-medium text-muted-foreground">
                        {formatMoney(batch.total_expected)}
                      </TableCell>

                      {/* Collected & Overpaid */}
                      <TableCell className="text-right align-middle text-sm">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(batch.total_collected)}
                        </div>
                        {batch.total_overpaid > 0 && (
                          <div className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 mt-0.5">
                            +{formatMoney(batch.total_overpaid)} Overpaid
                          </div>
                        )}
                      </TableCell>

                      {/* Pending */}
                      <TableCell className="text-right align-middle text-sm">
                        <div
                          className={`font-semibold ${
                            batch.total_pending > 0
                              ? "text-rose-500 dark:text-rose-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatMoney(batch.total_pending)}
                        </div>
                      </TableCell>

                      {/* Collection Rate Bar */}
                      <TableCell className="px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${collectionPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-9 tabular-nums text-right mt-1.5">
                            {Math.round(collectionPct)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
