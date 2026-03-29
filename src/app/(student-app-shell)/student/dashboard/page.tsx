import { Suspense } from "react";
import { MyEnrollmentsSkeleton } from "./_features/enrollments/components/MyEnrollmentsSkeleton";
import { MyEnrollments } from "./_features/enrollments/components/MyEnrollments";
import { ExploreBatchesSkeleton } from "./_features/explore/components/ExploreBatchesSkeleton";
import { ExploreBatches } from "./_features/explore/components/ExploreBatches";
import { ExploreCoursesSkeleton } from "./_features/explore/components/ExploreCoursesSkeleton";
import { ExploreCourses } from "./_features/explore/components/ExploreCourses";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-2  sm:px-10 ">
        {/* Main surface */}
        <div className=" bg-background ">
          {/* Header */}
          <header className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Learning
            </h1>
            <p className="text-sm text-muted-foreground">
              Continue where you left off and discover new programs
            </p>
          </header>

          {/* ENROLLMENTS */}
          <section
            aria-labelledby="my-enrollments-heading"
            className="space-y-4"
          >
            <h2
              id="my-enrollments-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              Your Enrollments
            </h2>

            <Suspense fallback={<MyEnrollmentsSkeleton />}>
              <MyEnrollments />
            </Suspense>
          </section>

          {/* explore */}
          <section className="mt-12 space-y-10">
            {/* Explore Batches */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Explore Batches
                </h2>
                <p className="text-xs text-muted-foreground">
                  Structured programs with multiple subjects and guided learning
                </p>
              </div>

              <Suspense fallback={<ExploreBatchesSkeleton />}>
                <ExploreBatches />
              </Suspense>
            </div>

            {/* Explore Courses */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Explore Courses
                </h2>
                <p className="text-xs text-muted-foreground">
                  Individual subjects you can learn at your own pace
                </p>
              </div>

              <Suspense fallback={<ExploreCoursesSkeleton />}>
                <ExploreCourses />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
