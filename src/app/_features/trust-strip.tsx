import { BookOpen, Brain, MonitorPlay, Trophy } from "lucide-react";

const ITEMS = [
  {
    icon: BookOpen,
    label: "Structured Learning Paths",
  },
  {
    icon: Brain,
    label: "Topic-wise Practice Sets",
  },
  {
    icon: Trophy,
    label: "Real Exam-Level Tests",
  },
  {
    icon: MonitorPlay,
    label: "Live + Recorded Classes",
  },
];

export function TrustStrip() {
  return (
    <section>
      <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background">
                  <Icon className="size-4" />
                </div>

                <p className="text-sm font-medium leading-5 text-foreground/80">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
