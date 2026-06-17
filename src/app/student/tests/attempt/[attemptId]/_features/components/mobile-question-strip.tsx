"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import { getGridClasses } from "../helpers/grid-colors";
import { getAnswerModeLabel, MappedSection } from "../helpers/question-map";
import SyncDot from "./sync-dot";
import { useSyncStatus } from "../hooks/use-sync-status";
import { MobileActionLayout } from "../hooks/use-mobile-action-layout";
import ExamPreferencesPopover from "./exam-preference";

type Props = {
  sections: MappedSection[];
  activeId: string;
  attemptId: string;
  onJump: (questionId: string) => void;
  onOpenNavigator: () => void;
  layoutMode: MobileActionLayout;
  onLayoutModeChange: (mode: MobileActionLayout) => void;
};

export default function MobileQuestionStrip({
  sections,
  activeId,
  onJump,
  onOpenNavigator,
  attemptId,
  layoutMode,
  onLayoutModeChange,
}: Props) {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const syncStatus = useSyncStatus(attemptId);

  const [hasOverflow, setHasOverflow] = useState(false);

  // All questions across all sections
  const allQuestions = useMemo(
    () => sections.flatMap((section) => section.questions),
    [sections],
  );

  // Current section for header information
  const currentSection = sections.find((section) =>
    section.questions.some((q) => q.id === activeId),
  );

  // Current question index across the whole exam
  const activeIndex = allQuestions.findIndex((q) => q.id === activeId);

  // Auto-scroll active question into view
  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  // Detect overflow to decide navigator button placement
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const checkOverflow = () => {
      setHasOverflow(container.scrollWidth > container.clientWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [allQuestions.length]);

  if (!currentSection) return null;

  return (
    <div className="min-[820px]:hidden bg-background px-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 truncate text-xs font-medium text-muted-foreground">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSection.subjectLabel}
                initial={{
                  opacity: 0,
                  y: 4,
                  filter: "blur(4px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                  filter: "blur(4px)",
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-1 truncate text-xs font-medium text-muted-foreground"
              >
                <span className="capitalize">
                  {currentSection.subjectLabel}
                </span>

                <span>•</span>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentSection.answerMode}
                    initial={{
                      opacity: 0,
                      y: 4,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -4,
                      filter: "blur(4px)",
                    }}
                    transition={{
                      duration: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {getAnswerModeLabel(currentSection.answerMode)}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className=" flex items-center justify-start min-w-18.75 ">
            <SyncDot status={syncStatus} />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {activeIndex + 1}
            </span>

            <span className="mx-1">of</span>

            <span className="tabular-nums">{allQuestions.length}</span>
          </span>

          <ExamPreferencesPopover
            layoutMode={layoutMode}
            onLayoutModeChange={onLayoutModeChange}
          />
        </div>
      </div>

      {/* Question Strip */}
      <div className="flex items-center gap-0">
        {/* Scrollable Questions */}
        <div
          ref={scrollContainerRef}
          className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-none pr-1"
        >
          <div className="flex w-max items-center gap-2">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="flex items-center gap-2">
                {/* Section separator */}
                {sectionIndex > 0 && (
                  <div
                    aria-hidden
                    className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80"
                  />
                )}

                {section.questions.map((q) => (
                  <Button
                    key={q.id}
                    ref={q.id === activeId ? activeButtonRef : null}
                    size="sm"
                    variant="ghost"
                    onClick={() => onJump(q.id)}
                    className={cn(
                      "relative h-8 w-8 shrink-0 p-0 text-xs font-medium",
                      getGridClasses(q.state),
                      q.id === activeId &&
                        "after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-full after:bg-primary/80 before:absolute before:bottom-0.5 before:left-1/2 before:h-1 before:w-5 before:-translate-x-1/2 before:rounded-full before:bg-primary/20 before:blur-sm",
                    )}
                  >
                    {q.index}
                  </Button>
                ))}
              </div>
            ))}

            {/* Natural placement when everything fits */}
            {!hasOverflow && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenNavigator}
                className={cn(
                  "relative h-8 w-8 shrink-0 p-0",
                  "rounded-md border border-border bg-muted",
                  "transition-all duration-150 ease-out",
                  "hover:shadow-sm active:scale-[0.97]",
                )}
              >
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        {/* Sticky placement when questions overflow */}

        {hasOverflow && (
          <div className="flex items-center gap-1.5">
            <div aria-hidden className="h-8 w-px bg-border mb-1" />

            <Button
              size="sm"
              variant="ghost"
              onClick={onOpenNavigator}
              className={cn(
                "relative h-8 w-8 shrink-0 p-0",
                "rounded-md border border-border bg-muted",
                "transition-all duration-150 ease-out",
                "hover:shadow-sm active:scale-[0.97]",
                "mb-1",
              )}
            >
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
