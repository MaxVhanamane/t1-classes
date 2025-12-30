import { Suspense } from "react";
import {
  StudentsStat,
  TeachersStat,
  EnrollmentsStat,
  CoursesStat,
  BatchesStat,
  PendingFeesStat,
  AdminStat,
} from "./_features/components/stats";
import { StatCardSkeleton } from "./_features/components/stat-card-skeleton";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your institute in real time
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Suspense fallback={<StatCardSkeleton />}>
          <StudentsStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <AdminStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <TeachersStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <EnrollmentsStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <CoursesStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <BatchesStat />
        </Suspense>

        <Suspense fallback={<StatCardSkeleton />}>
          <PendingFeesStat />
        </Suspense>
      </div>
    </div>
  );
}
