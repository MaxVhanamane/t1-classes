import { Activity, ArrowRight, Target } from "lucide-react";
import { Link } from "@/src/components/ui/link";
import { BatchEnrollment } from "@/src/lib/services/enrollments/types";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";

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
          <Link
            key={`perf-${batch.enrollmentId}`}
            href={`/student/performance/${batch.batch.id}`}
            className="group relative shadow-sm flex flex-col justify-between overflow-hidden rounded-xl border p-6 text-foreground transition-all h-55"
          >
            <CardGlow color="sky" hideLightGlow />
            <DottedBackground />

            {/* Subtle Background SVG Graph */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 opacity-20 transition-all duration-500 group-hover:scale-105 group-hover:opacity-35">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient
                    id={`chart-gradient-${batch.enrollmentId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--sky-400, #38bdf8)"
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--sky-400, #38bdf8)"
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d="M0,120 Q125,40 250,90 T500,30 L500,150 L0,150 Z"
                  fill={`url(#chart-gradient-${batch.enrollmentId})`}
                />
                {/* Line stroke */}
                <path
                  d="M0,120 Q125,40 250,90 T500,30"
                  fill="none"
                  stroke="var(--sky-400, #38bdf8)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="mb-2 flex items-center gap-2 text-indigo-400">
                <Target className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Batch Analytics
                </span>
              </div>

              <h3 className="block w-full truncate text-xl font-semibold tracking-tight">
                {batch.batch.title || "Your Batch"}
              </h3>

              <p className="w-full text-sm text-slate-400 line-clamp-2">
                View your test scores, class percentile, accuracy breakdown, and
                attendance trends.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex items-center text-sm font-medium">
              View Detailed Report
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
