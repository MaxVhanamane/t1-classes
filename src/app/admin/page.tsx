import { DashboardOverview } from "./_features/components/dashboard-overview";
import { RevenueTrendChart } from "./_features/components/revenue-trend-chart";
import { EnrollmentDonutChart } from "./_features/components/enrollment-donut-chart";
import { BatchHealthTable } from "./_features/components/batch-health-table"; // <-- Import

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-2 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <DashboardOverview />

      <div className="w-full">
        <RevenueTrendChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnrollmentDonutChart type="courses" />
        <EnrollmentDonutChart type="batches" />
      </div>

      {/* Row 4: Batch Health Table */}
      <div className="w-full">
        <BatchHealthTable />
      </div>
    </div>
  );
}
