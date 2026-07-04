import { BarChart3, Clock3, FileCheck2, Layers3 } from "lucide-react";
import { MobileLandscapePreview } from "./mobile-landscape-preview";
import DottedBackground from "@/src/components/dotted-background";

const FEATURES = [
  {
    icon: Layers3,
    title: "Exam-Accurate Test Engine",
    description:
      "Supports every major competitive exam question type with authentic negative and partial marking.",
  },
  {
    icon: Clock3,
    title: "Practice Without Limits",
    description:
      "Attempt tests whenever you want with fast navigation, review tools, and a distraction-free interface.",
  },
  {
    icon: BarChart3,
    title: "Insights Beyond Scores",
    description:
      "Analyze rank, percentile, section performance, question-wise accuracy, time spent, and detailed explanations.",
  },
  {
    icon: FileCheck2,
    title: "Benchmark Your Performance",
    description:
      "See how you compare with toppers and overall test averages, including time spent and marks earned on every question.",
  },
];
export function TestPlatformShowcase() {
  return (
    <section>
      <div className="mx-auto max-w-6xl">
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
        <div className="relative mx-auto mt-14 max-w-5xl lg:mt-16">
          {/* Desktop Premium Frame */}
          <div
            className="hidden rounded-xl p-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.08) 35%, rgba(255,255,255,.03) 70%, rgba(255,255,255,.14))",
            }}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-background/75 p-3 backdrop-blur-xl lg:p-4">
              {/* Soft Reflection */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/8 to-transparent"
              />

              <div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-[0_24px_70px_rgba(15,23,42,.12)]">
                <MobileLandscapePreview
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary-4.3.webp"
                  alt="T1 Classes live class — teacher explaining with live student chat"
                  width={1400}
                  height={788}
                  mobileWidth={1200}
                  mobileHeight={900}
                  priority
                  className="block w-full"
                />
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            <MobileLandscapePreview
              src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary.webp"
              mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary-4.3.webp"
              alt="T1 Classes live class — teacher explaining with live student chat"
              width={1400}
              height={788}
              mobileWidth={1200}
              mobileHeight={900}
              priority
              className="block w-full rounded-md border border-border/50 shadow-2xl"
            />
          </div>

          {/* Ground Shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-24 -bottom-8 -z-10 hidden h-20 rounded-full bg-black/10 blur-3xl sm:block"
          />
        </div>

        {/* Features */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2 lg:mt-16">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/50 bg-muted-soft p-6 backdrop-blur-sm relative"
              >
                <DottedBackground />
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
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
