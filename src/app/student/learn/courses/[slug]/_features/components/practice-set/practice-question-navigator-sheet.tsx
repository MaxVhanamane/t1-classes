"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/src/components/ui/drawer";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

import {
  getGridStyles,
  getQuestionState,
  getReviewState,
  getReviewStyles,
  QuestionState,
  ReviewState,
} from "../../helper-functions/practice-grid";

import { PracticeSessionQuestion } from "../../types/practice-session.types";
import { LayoutGrid } from "lucide-react";

type Props = {
  container: HTMLDivElement | null;

  reviewMode: boolean;

  index: number;

  questions: PracticeSessionQuestion[];

  visited: Set<string>;

  answers: Record<string, string>;

  markedForReview: Set<string>;

  onJump: (index: number) => void;
};

export function PracticeQuestionNavigatorSheet({
  container,
  reviewMode,
  index,
  questions,
  visited,
  answers,
  markedForReview,
  onJump,
}: Props) {
  const [open, setOpen] = useState(false);

  const legendItems = reviewMode
    ? [
        { label: "Correct", state: "correct" },
        { label: "Incorrect", state: "incorrect" },
        { label: "Not Answered", state: "not_answered" },
      ]
    : [
        { label: "Not Visited", state: "not_visited" },
        { label: "Not Answered", state: "not_answered" },
        { label: "Answered", state: "answered" },
        { label: "Review", state: "review" },
        { label: "Ans + Review", state: "answered_review" },
      ];

  return (
    <Drawer container={container} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-full gap-2 border-primary/20 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Navigator
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[90dvh] max-h-[90dvh]">
        <div className="mx-auto flex h-full w-full max-w-lg min-h-0 flex-col">
          <DrawerHeader>
            <DrawerTitle>Question Navigator</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            <div className="space-y-6">
              {/* LEGEND */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Question Status
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                  {legendItems.map((item) => {
                    const styles = reviewMode
                      ? getReviewStyles(item.state as ReviewState)
                      : getGridStyles(item.state as QuestionState);

                    return (
                      <LegendItem
                        key={item.label}
                        label={item.label}
                        className={styles}
                      />
                    );
                  })}
                </div>
              </div>

              {/* GRID */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Questions
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => {
                    let styles: string;

                    if (reviewMode) {
                      const reviewState = getReviewState({
                        answers,
                        question: q,
                      });

                      styles = getReviewStyles(reviewState);
                    } else {
                      const questionState = getQuestionState({
                        visited,
                        answers,
                        markedForReview,
                        questionId: q.id,
                      });

                      styles = getGridStyles(questionState);
                    }

                    return (
                      <Button
                        key={q.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onJump(i);
                          setOpen(false);
                        }}
                        className={cn(
                          "relative h-10 w-10 rounded-md border p-0 text-xs font-medium",
                          "transition hover:scale-[1.03]",
                          styles,
                          "text-foreground",
                          i === index &&
                            "after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                        )}
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function LegendItem({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded border", className)} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
