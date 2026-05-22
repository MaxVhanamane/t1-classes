import {
  BarChart3,
  BookOpen,
  Brain,
  Clock3,
  MonitorPlay,
  Trophy,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Topic-wise Practice Tests",
    description:
      "Practice immediately after each topic to strengthen understanding and retention.",
  },
  {
    icon: Trophy,
    title: "Advanced Test Platform",
    description:
      "Attempt full-length tests with advanced question types, detailed analytics, and a real exam-like experience.",
  },
  {
    icon: MonitorPlay,
    title: "Live + Recorded Classes",
    description:
      "Attend live sessions and revisit recordings anytime for revision and clarity.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track accuracy, speed, weak areas, and overall improvement through detailed insights.",
  },
  {
    icon: BookOpen,
    title: "Structured Learning Flow",
    description:
      "Learn chapter-by-chapter with organized lessons, notes, and guided practice.",
  },
  {
    icon: Clock3,
    title: "Learn at Your Pace",
    description:
      "Study anytime from mobile or desktop with uninterrupted access to your courses.",
  },
];

export function WhyT1Section() {
  return (
    <section>
      {/* heading */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Why T1 Classes
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          A structured learning experience designed for consistent improvement.
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Learn through structured lessons, topic-wise practice tests, live
          classes, and detailed performance tracking all in one place.
        </p>
      </div>

      {/* cards */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* glow */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
              </div>

              {/* icon */}
              <div className="relative flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
                <Icon className="size-5" />
              </div>

              {/* content */}
              <div className="relative mt-6">
                <h3 className="text-lg font-bold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
