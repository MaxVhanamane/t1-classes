import { BarChart3, Clock3, FileCheck2, Layers3 } from "lucide-react";
import DottedBackground from "@/src/components/dotted-background";
import { PremiumImageSlider } from "./premium-image-slider";
import { Card, CardContent } from "@/src/components/ui/card";

const testImages = [
  {
    src: "https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-ui.webp",
    mobileSrc:
      "https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-ui-4.3.webp",
    alt: "T1 Classes test interface",
    width: 1400,
    height: 788,
    mobileWidth: 1200,
    mobileHeight: 900,
    priority: true, // Let the second image lazy load
    className: "block w-full",
  },
  {
    src: "https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary.webp",
    mobileSrc:
      "https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/t1-test-summary-4.3.webp",
    alt: "T1 Classes test detailed analysis",
    width: 1400,
    height: 788,
    mobileWidth: 1200,
    mobileHeight: 900,
    priority: false, // Eager load the first image so the Largest Contentful Paint (LCP) is fast
    className: "block w-full",
  },
];

const FEATURES = [
  {
    icon: Clock3,
    title: "Structured Live Tests",
    description:
      "Take scheduled tests in a rigorous, exam-like interface complete with a question navigator and mark-for-review tools.",
  },
  {
    icon: BarChart3,
    title: "Micro-Level Analytics",
    description:
      "Unlock detailed post-test data including rank, percentile, section-wise performance, and complete step-by-step solutions.",
  },
  {
    icon: Layers3,
    title: "Exam-Accurate Formats",
    description:
      "Tackle single, multi-correct, numerical, and match-matrix questions with authentic partial and negative marking rules.",
  },
  {
    icon: FileCheck2,
    title: "Time & Accuracy Tracking",
    description:
      "Analyze the exact seconds spent per question and see how your speed and accuracy stack up against the topper and the class average.",
  },
];
export function TestPlatformShowcase() {
  return (
    <section>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Advanced Test Engine
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
            Experience a true exam environment.
            <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              Analyze every mark and every second.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
            Practice with all advanced question formats on a rigorous platform.
            Get instant access to deep analytics covering partial marking,
            negative scores, and the exact time you spent per question compared
            to your peers.
          </p>
        </div>
        {/* Screenshot */}
        <div className="relative mx-auto mt-14 max-w-5xl lg:mt-16">
          {/* Desktop Premium Frame */}
          <div className="hidden rounded-3xl p-px sm:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b bg-muted p-3 backdrop-blur-xl">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-muted-soft ">
                <PremiumImageSlider
                  images={testImages}
                  interval={5000} // Slides every 5 seconds
                />
              </div>
            </div>
          </div>

          {/* Mobile */}

          <div className="sm:hidden">
            <div
              className="relative rounded-md p-px"
              style={{
                background:
                  "linear-gradient(180deg, rgba(113,113,122,.32), rgba(161,161,170,.14) 35%, rgba(161,161,170,.06) 70%, rgba(113,113,122,.24))",
              }}
            >
              {/* soft glass highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-md bg-linear-to-b from-white/60 via-transparent to-transparent dark:from-white/10" />

              <div className="overflow-hidden rounded-md border border-zinc-300/60 dark:border-white/10 bg-background">
                <PremiumImageSlider
                  images={testImages}
                  interval={5000} // Slides every 5 seconds
                />
              </div>
            </div>
          </div>

          {/* Ground Shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-24 -bottom-8 -z-10 hidden h-20 rounded-full bg-black/10 blur-3xl sm:block"
          />
        </div>

        {/* Features */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3 lg:mt-16">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden rounded-xl py-2 shadow-sm transition-shadow bg-muted-soft backdrop-blur-sm"
              >
                <DottedBackground className="opacity-50" />

                {/* Subtle top glows */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

                <CardContent className="relative flex h-full items-start gap-4 p-6">
                  {/* Icon Box */}
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10 shadow-sm">
                    <Icon className="size-5 text-primary" strokeWidth={1.5} />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
