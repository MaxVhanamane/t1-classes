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
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* LEFT */}
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Advanced Test Platform
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Designed to feel like a real exam environment.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Attempt tests with advanced question formats, real exam-style
            navigation, detailed marking systems, and complete result
            breakdowns.
          </p>

          {/* FEATURES */}
          <div className="mt-10 grid gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    {/* icon */}
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
                      <Icon className="size-5" />
                    </div>

                    {/* content */}
                    <div>
                      <h3 className="text-base font-bold tracking-tight">
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

        {/* RIGHT */}
        <div className="relative">
          {/* glow */}
          <div className="absolute inset-0 rounded-[2rem] bg-primary/10 blur-3xl" />

          {/* image */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 shadow-2xl backdrop-blur-xl">
            <Image
              src="/images/test-platform-preview.webp"
              alt="T1 Classes Test Platform"
              width={1400}
              height={1000}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
