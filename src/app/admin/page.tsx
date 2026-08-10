import { DashboardOverview } from "./_features/components/dashboard-overview";
import { RevenueTrendChart } from "./_features/components/revenue-trend-chart";
import { EnrollmentDonutChart } from "./_features/components/enrollment-donut-chart";
import { BatchHealthTable } from "./_features/components/batch-health-table";
import { BatchFinancialsTable } from "./_features/components/batch-financial-table";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-2 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Row 1: Global KPIs */}
      <DashboardOverview />

      {/* Row 2: Macro Financials (Trend) */}
      <div className="w-full">
        <RevenueTrendChart />
      </div>

      {/* Row 3: Micro Financials (Batch Breakdown) */}
      <div className="w-full">
        <BatchFinancialsTable />
      </div>

      {/* Row 4: Macro Academics (Enrollment Distribution) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnrollmentDonutChart type="courses" />
        <EnrollmentDonutChart type="batches" />
      </div>

      {/* Row 5: Micro Academics (Batch Health) */}
      <div className="w-full">
        <BatchHealthTable />
      </div>
    </div>
  );
}
