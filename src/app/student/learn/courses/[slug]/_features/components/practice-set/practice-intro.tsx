"use client";

import { Button } from "@/src/components/ui/button";

import { Brain, CheckCircle2, Clock3, Eye, Target } from "lucide-react";

import { motion } from "motion/react";

import { cn } from "@/src/lib/utils";

type Props = {
  title: string;
  description: string | null;
  onStart: () => void;
};

export function PracticeIntro({ title, description, onStart }: Props) {
  return (
    <div className="flex justify-center px-2 py-6 sm:px-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full max-w-lg"
      >
        <div className="overflow-hidden">
          {/* HEADER */}
          <div className="relative overflow-hidden px-7 py-1 text-center ">
            {/* ICON */}
            <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-background/80  ring-1 ring-border/60 backdrop-blur">
              <Brain className="h-6 w-6 text-primary" />
            </div>

            {/* TITLE */}
            <div className="relative z-10 mt-5">
              <h2 className="text-2xl font-semibold tracking-tight leading-tight">
                {title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description ??
                  "Use this practice set to check how well you understood the concepts covered in this topic or chapter."}
              </p>
            </div>
          </div>

          {/* BODY */}
          <div className="space-y-7 px-7 py-7">
            {/* WHAT TO EXPECT */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  What to expect
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your progress will be tracked throughout the session.
                </p>
              </div>

              <div className="space-y-3">
                <IntroItem
                  icon={Target}
                  title="Track understanding"
                  description="Measure how well you understood the concepts from this lesson."
                />

                <IntroItem
                  icon={CheckCircle2}
                  title="Review performance"
                  description="See which questions you answered correctly, incorrectly, or skipped."
                />

                <IntroItem
                  icon={Eye}
                  title="Mark for review"
                  description="Flag difficult questions and revisit them later during practice."
                />
              </div>
            </div>

            {/* QUESTION STATUS GUIDE */}
            <div className="space-y-4 rounded-2xl bg-muted/20 p-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  Question status guide
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Colors in the navigator help you quickly identify question
                  states.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatusItem
                  label="Not Visited"
                  className="dark:bg-muted bg-gray-50 border-border"
                />

                <StatusItem
                  label="Not Answered"
                  className="dark:bg-yellow-500/10 bg-yellow-200 border-yellow-500/40"
                />

                <StatusItem
                  label="Answered"
                  className="dark:bg-emerald-500/10 bg-green-200 border-emerald-500/40"
                />

                <StatusItem
                  label="Review"
                  className="dark:bg-purple-500/10 bg-purple-200 border-purple-500/40"
                />

                <StatusItem
                  label="Ans + Review"
                  className="dark:bg-blue-500/10 bg-blue-200 border-blue-500/40"
                />
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="flex items-start gap-2 rounded-xl bg-muted/20 px-4 py-3">
              <Clock3 className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-relaxed text-muted-foreground">
                Take your time to think through each question carefully before
                saving your answer.
              </p>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="h-11 w-full rounded-xl"
              onClick={onStart}
            >
              Start Practice
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IntroItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/20 px-4 py-3">
      <div className="mt-0.5 flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium tracking-tight">{title}</p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-md border", className)} />

      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
