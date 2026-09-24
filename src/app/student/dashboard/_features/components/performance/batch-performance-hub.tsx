import { Activity, ArrowRight, BarChart2 } from "lucide-react";
import { Link } from "@/src/components/ui/link";
import { BatchEnrollment } from "@/src/lib/services/enrollments/types";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import AnimatedStudent from "./animated-student";

interface BatchPerformanceHubProps {
  batchEnrollments: BatchEnrollment[];
}

export function BatchPerformanceHub({
  batchEnrollments,
}: BatchPerformanceHubProps) {
  if (!batchEnrollments || batchEnrollments.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="h-5 w-5" />
        <h2 className="text-sm font-medium tracking-wide uppercase">
          Performance & Analytics
        </h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batchEnrollments.map((batch) => (
          <div
            key={`perf-${batch.enrollmentId}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 text-foreground transition-all h-54"
          >
            <CardGlow color="blue" hideLightGlow />
            {/* <DottedBackground className="opacity-20" /> */}

            {/* Subtle Background SVG Graph */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-34 dark:opacity-20 opacity-30 transition-all duration-500  group-hover:opacity-40 z-30">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient
                    id={`chart-gradient-${batch.enrollmentId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                {/* <path
                  d="M0,120 C100,120 150,60 250,80 C350,100 420,30 500,20 L500,150 L0,150 Z"
                  fill={`url(#chart-gradient-${batch.enrollmentId})`}
                /> */}

                {/* Line stroke */}
                <path
                  d="M0,120 C100,120 150,60 250,80 C350,100 420,30 500,20"
                  fill="none"
                  // Uses standard blue in light mode, and pale blue-300 in dark mode to perfectly match the CardGlow border
                  className="stroke-blue-500 dark:stroke-blue-300"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Render our smart sub-component here! */}
                <AnimatedStudent />
              </svg>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="mb-2 flex items-center gap-2 text-foreground">
                <BarChart2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Batch Analytics
                </span>
              </div>

              <h3 className="block w-full truncate font-semibold tracking-tight">
                {batch.batch.title || "Your Batch"}
              </h3>

              <p className="w-full text-sm text-slate-400 line-clamp-2">
                View your test scores, class percentile, accuracy breakdown, and
                attendance trends.
              </p>
            </div>

            {/* Link anchored to the bottom right */}
            <div className="relative z-10 mt-6 flex w-full justify-end">
              <Link
                href={`/student/performance/${batch.batch.id}`}
                className="inline-flex w-fit items-center text-sm font-medium"
              >
                View Detailed Report
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
