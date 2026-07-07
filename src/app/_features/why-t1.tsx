import DottedBackground from "@/src/components/dotted-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/src/components/ui/card";
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Why T1 Classes
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl leading-[1.15]">
          A proven learning system,{" "}
          <span className="bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
            built to secure your rank.
          </span>
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Structured lessons, topic-wise practice, live classes, weekly tests,
          and detailed test analysis all in one place.
        </p>
      </div>

      {/* cards */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="group relative overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md py-2"
            >
              {/* Subtle top glows */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

              <DottedBackground className="opacity-50" />

              {/* Main inner content */}
              <CardContent className="relative flex flex-col gap-5 p-6 h-full">
                {/* icon */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border">
                  <Icon
                    className="size-5 text-secondary-foreground"
                    strokeWidth={1.5}
                  />
                </div>

                {/* content text */}
                <div className="flex flex-col gap-2">
                  {/* Overriding the default text-2xl from shadcn CardTitle to fit your design */}
                  <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                    {feature.title}
                  </CardTitle>
                  {/* CardDescription automatically handles the text-muted-foreground and sizing */}
                  <CardDescription className="text-sm leading-6">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
