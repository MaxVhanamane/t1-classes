import { Suspense } from "react";
import { MyEnrollmentsSkeleton } from "./_features/components/enrollments/components/MyEnrollmentsSkeleton";
import { MyEnrollments } from "./_features/components/enrollments/components/MyEnrollments";
import { ExploreCategories } from "./_features/components/explore-categories";

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

          <section className="mt-12">
            <ExploreCategories />
          </section>
        </div>
      </div>
    </div>
  );
}

//  <section className="mt-12 space-y-10">

//       <div className="space-y-4">
//         <div className="space-y-1">
//           <h2 className="text-sm font-medium text-muted-foreground">
//             Explore Batches
//           </h2>
//           <p className="text-xs text-muted-foreground">
//             Structured programs with multiple subjects and guided learning
//           </p>
//         </div>

//         <Suspense fallback={<ExploreBatchesSkeleton />}>
//           <ExploreBatches />
//         </Suspense>
//       </div>

//       <div className="space-y-4">
//         <div className="space-y-1">
//           <h2 className="text-sm font-medium text-muted-foreground">
//             Explore Courses
//           </h2>
//           <p className="text-xs text-muted-foreground">
//             Individual subjects you can learn at your own pace
//           </p>
//         </div>

//         <Suspense fallback={<ExploreCoursesSkeleton />}>
//           <ExploreCourses />
//         </Suspense>
//       </div>
//     </section>
