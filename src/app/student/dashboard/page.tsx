import { Suspense } from "react";
import { MyEnrollmentsSkeleton } from "./_features/components/enrollments/components/MyEnrollmentsSkeleton";
import { MyEnrollments } from "./_features/components/enrollments/components/MyEnrollments";
import { ExploreCategories } from "./_features/components/explore-categories";
import { Layers } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-3 py-2 sm:px-10 ">
        {/* Main surface */}
        <div className="bg-background">
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-5 w-5" />
              <h2
                id="my-enrollments-heading"
                className="text-sm font-medium tracking-wide uppercase"
              >
                Your Enrollments
              </h2>
            </div>

            <Suspense fallback={<MyEnrollmentsSkeleton />}>
              <MyEnrollments />
            </Suspense>
          </section>

          {/* explore */}

          <section className="mt-12">
            <ExploreCategories />
          </section>
        </div>
      </div>
    </div>
  );
}
