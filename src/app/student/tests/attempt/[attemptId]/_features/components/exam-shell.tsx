"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import QuestionGrid from "./question-grid";
import QuestionWorkspace from "./question-workspace";
import MobileQuestionStrip from "./mobile-question-strip";

import { StateItem } from "../types/workspace.types";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { useAttemptState } from "../hooks/use-attempt-state";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/src/components/ui/drawer";
import { buildQuestionMap } from "../helpers/question-map";
import { useTestSubmit } from "../hooks/use-test-submit";
import { useMobileActionLayout } from "../hooks/use-mobile-action-layout";
import { cn } from "@/src/lib/utils";
import { QuestionTimer } from "../hooks/use-question-time-tracker";

type Props = {
  attemptId: string;
  sections: Section[];
  state: StateItem[];
  testSubmission: ReturnType<typeof useTestSubmit>;
  timer: QuestionTimer;
};

export default function ExamShell({
  attemptId,
  sections,
  state,
  testSubmission,
  timer,
}: Props) {
  const queryClient = useQueryClient();
  const didInitFirstVisit = useRef(false);
  // ----------------------------------
  // Hydrate cache ONCE from server
  // ----------------------------------
  const { state: attemptState } = useAttemptState(attemptId, state);
  const { layoutMode, setLayoutMode } = useMobileActionLayout();
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const flat = useMemo(() => {
    return sections.flatMap((s) =>
      s.questions.map((q) => ({
        id: q.id,
        sectionId: s.id,
      })),
    );
  }, [sections]);

  // ======================================================
  // Ensure the first question is marked as visited.
  //
  // A student starts on Question 1 automatically,
  // even before clicking anything.
  //
  // We update React Query cache once so navigator,
  // counts, and review state remain consistent.
  // ======================================================

  useEffect(() => {
    if (didInitFirstVisit.current) return;

    const firstId = flat[0]?.id;

    if (!firstId) return;

    didInitFirstVisit.current = true;

    const key = ["attempt-state", attemptId];

    queryClient.setQueryData<StateItem[]>(key, (prev = []) => {
      const exists = prev.find((item) => item.questionId === firstId);

      if (exists) {
        if (exists.visited) return prev;

        return prev.map((item) =>
          item.questionId === firstId
            ? {
                ...item,
                visited: true,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          questionId: firstId,
          answer: null,
          visited: true,
          markedForReview: false,
          timeSpentSeconds: 0,
        },
      ];
    });
  }, [flat, attemptId, queryClient]);

  const [activeId, setActiveId] = useState(flat[0]?.id);

  // ======================================================
  // Notify timer whenever active question changes.
  //
  // enterQuestion():
  // 1. Flushes previous question time.
  // 2. Starts timing new question.
  // 3. Updates displayed timer.
  //
  // This is the single source of truth for
  // question-to-question timing transitions.
  // ======================================================

  useLayoutEffect(() => {
    if (!activeId) return;

    timer.enterQuestion(activeId);
  }, [activeId, timer]);

  // ======================================================
  // Question navigation.
  //
  // Only updates active question and visited state.
  //
  // Timing is handled by the activeId effect above,
  // so we intentionally DO NOT call timer.enterQuestion()
  // here to avoid double-flushing and timing bugs.
  // ======================================================
  const handleNavigate = (id: string) => {
    setActiveId(id);

    const key = ["attempt-state", attemptId];

    queryClient.setQueryData<StateItem[]>(key, (prev = []) => {
      const exists = prev.find((item) => item.questionId === id);

      if (exists) {
        return prev.map((item) =>
          item.questionId === id
            ? {
                ...item,
                visited: true,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          questionId: id,
          answer: null,
          visited: true,
          markedForReview: false,
          timeSpentSeconds: 0,
        },
      ];
    });
  };

  const mappedSections = useMemo(
    () => buildQuestionMap(sections, attemptState),

    [sections, attemptState],
  );

  return (
    <>
      <div className="flex h-full min-[820px]:h-[calc(100dvh-101.6px)] flex-col min-[820px]:flex-row">
        {/* MOBILE STRIP */}
        <div className="sticky top-9 z-20 min-[820px]:hidden">
          <MobileQuestionStrip
            sections={mappedSections}
            activeId={activeId}
            onJump={handleNavigate}
            onOpenNavigator={() => setNavigatorOpen(true)}
            attemptId={attemptId}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
          />
        </div>

        {/* MAIN */}
        <div
          className={cn(
            "p-3 md:p-4 h-[calc(100dvh-108px)] min-[820px]:h-[calc(100dvh-101.6px)] w-full",
            !(layoutMode === "fixed") && "pb-0",
          )}
        >
          <QuestionWorkspace
            attemptId={attemptId}
            sections={sections}
            activeQuestionId={activeId}
            onNavigate={handleNavigate}
            state={state}
            testSubmission={testSubmission}
            layoutMode={layoutMode}
            timer={timer}
          />
        </div>

        {/* SIDE GRID */}
        <aside className="hidden w-82.5 border-l bg-background min-[820px]:block shrink-0">
          <div className="sticky top-0 h-[calc(100dvh-101.6px)]  p-4">
            <QuestionGrid
              sections={mappedSections}
              onJump={handleNavigate}
              activeId={activeId}
            />
          </div>
        </aside>
      </div>

      {/* MOBILE NAVIGATOR DRAWER */}
      <Drawer open={navigatorOpen} onOpenChange={setNavigatorOpen}>
        <DrawerContent className="h-[90dvh] data-[vaul-drawer-direction=bottom]:max-h-[90dvh] rounded-t-3xl border-x-0 border-b-0 ">
          {/* Accessibility */}
          <DrawerHeader className=" pb-1.5">
            <DrawerTitle>Navigator</DrawerTitle>
            <DrawerDescription className="sr-only">
              Navigate between questions in the exam.
            </DrawerDescription>
          </DrawerHeader>

          {/* Navigator */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <QuestionGrid
              sections={mappedSections}
              activeId={activeId}
              onJump={(id) => {
                handleNavigate(id);
                setNavigatorOpen(false);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
