import Image from "next/image";
import { BarChart3, Clock3, FileCheck2, Layers3 } from "lucide-react";

const FEATURES = [
  {
    icon: Layers3,
    title: "Real Exam-style Questions",
    description:
      "Practice with different question patterns designed to match real competitive exams.",
  },
  {
    icon: Clock3,
    title: "Focused Test Experience",
    description:
      "Attempt tests in a distraction-free environment with smooth question navigation and review tools.",
  },
  {
    icon: BarChart3,
    title: "Detailed Result Breakdown",
    description:
      "Understand correct answers, mistakes, negative marking, partial marking, and overall performance clearly.",
  },
  {
    icon: FileCheck2,
    title: "Section-wise Analysis",
    description:
      "Review performance across sections and identify where you performed well or lost marks.",
  },
];

export function TestPlatformShowcase() {
  return (
    <section>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Advanced Test Platform
          </p>

          <h2 className="mt-4 text-balance text-3xl font-black tracking-tight sm:text-5xl">
            Experience a testing platform that feels like the real exam.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Practice with realistic question formats, distraction-free
            navigation, detailed marking schemes, and comprehensive performance
            analysis, everything designed to help you perform with confidence.
          </p>
        </div>

        {/* Screenshot */}
        <div className="relative mx-auto mt-14 max-w-6xl lg:mt-16">
          {/* Ambient Glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-105 rounded-full bg-primary/10 blur-3xl"
          />

          {/* Glass Frame */}
          <div
            className="rounded-xl p-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.08) 35%, rgba(255,255,255,.03) 70%, rgba(255,255,255,.14))",
              boxShadow:
                "0 40px 100px rgba(15,23,42,.12), 0 16px 40px rgba(15,23,42,.08)",
            }}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-background/75 p-2 backdrop-blur-xl sm:p-3 lg:p-4">
              {/* Inner Border */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"
              />

              {/* Soft Reflection */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/8 to-transparent"
              />

              <div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-[0_24px_70px_rgba(15,23,42,.12)]">
                <Image
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-summary.webp"
                  alt="T1 Classes Test Platform"
                  width={1400}
                  height={1000}
                  priority
                  className="block w-full"
                />
              </div>
            </div>
          </div>

          {/* Ground Shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 -bottom-8 -z-10 h-20 rounded-full bg-black/10 blur-3xl sm:inset-x-24"
          />
        </div>

        {/* Features */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2 lg:mt-16">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background">
                    <Icon className="size-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
