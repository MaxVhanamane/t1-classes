"use client";

import { Wallet, BookOpen } from "lucide-react";
import { useDashboardKPIs, DashboardKPIs } from "../hooks/use-dashboard-kpis";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { UsersOverviewStat } from "./user-overview-stat";

// --- FORMATTER ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// --- COMPONENT: FINANCIALS ---
function FinancialOverviewStat({
  data,
}: {
  data: DashboardKPIs["financials"];
}) {
  return (
    <Card className="h-54 shadow-none gap-1 py-1">
      <CardHeader className="flex flex-row items-center gap-3 p-5 pb-5">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <Wallet className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Financial Overview
          </h3>
          <p className="text-xs text-muted-foreground">
            Current fee collection status
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-2 gap-y-4 p-5 pt-0">
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Total Fees
          </div>
          <div className="text-xl font-bold tracking-tight">
            {formatCurrency(data.totalAmount)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Collected
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.totalPaid)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Pending
          </div>
          <div className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {formatCurrency(data.totalPending)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Overpaid
          </div>
          <div className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {formatCurrency(data.totalOverpaid)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- COMPONENT: ACADEMICS ---
function AcademicOverviewStat({ data }: { data: DashboardKPIs["academics"] }) {
  return (
    <Card className="flex h-54 flex-col shadow-none gap-1 py-1">
      <CardHeader className="flex flex-row items-center gap-3 p-5 pb-6">
        <div className="rounded-lg bg-indigo-500/10 p-2">
          <BookOpen className="size-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Academic Operations
          </h3>
          <p className="text-xs text-muted-foreground">
            Active learning metrics
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 p-5 pt-0 sm:gap-4">
        <div className="flex flex-col justify-end">
          <div className="mb-1 text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
            Active Courses
          </div>
          <div className="text-xl font-bold tracking-tight sm:text-2xl">
            {data.activeCourses}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="mb-1 text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
            Active Batches
          </div>
          <div className="text-xl font-bold tracking-tight sm:text-2xl">
            {data.activeBatches}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="mb-1 text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
            Total Enrollments
          </div>
          <div className="text-xl font-bold tracking-tight sm:text-2xl">
            {data.activeEnrollments}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- MAIN PARENT COMPONENT ---
export function DashboardOverview() {
  const { data, isLoading, isError } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-54 w-full rounded-xl" />
        <Skeleton className="h-54 w-full rounded-xl" />
        <Skeleton className="h-54 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <FinancialOverviewStat data={data.financials} />
      <UsersOverviewStat data={data.users} />
      <AcademicOverviewStat data={data.academics} />
    </div>
  );
}
