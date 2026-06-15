"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type Props = {
  attemptId: string;
  sections: Section[];
  state: StateItem[];
};

export default function ExamShell({ attemptId, sections, state }: Props) {
  const queryClient = useQueryClient();
  const didInitFirstVisit = useRef(false);
  // ----------------------------------
  // Hydrate cache ONCE from server
  // ----------------------------------
  const { state: attemptState } = useAttemptState(attemptId, state);

  const [navigatorOpen, setNavigatorOpen] = useState(false);

  // ----------------------------------
  // Hydrate cache ONCE from server
  // ----------------------------------
  // useEffect(() => {
  //   const key = ["attempt-state", attemptId];

  //   const existing = queryClient.getQueryData<StateItem[]>(key);

  //   if (!existing) {
  //     queryClient.setQueryData<StateItem[]>(key, state);
  //   }
  // }, [attemptId, state, queryClient]);

  const flat = useMemo(() => {
    return sections.flatMap((s) =>
      s.questions.map((q) => ({
        id: q.id,
        sectionId: s.id,
      })),
    );
  }, [sections]);

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
        },
      ];
    });
  }, [flat, attemptId, queryClient]);

  const [activeId, setActiveId] = useState(flat[0]?.id);

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
      <div className="flex h-full min-[820px]:h-[calc(100vh-101.6px)]  flex-col min-[820px]:flex-row">
        {/* MOBILE STRIP */}
        <div className="sticky top-11 z-20 min-[820px]:hidden">
          <MobileQuestionStrip
            sections={mappedSections}
            activeId={activeId}
            onJump={handleNavigate}
            onOpenNavigator={() => setNavigatorOpen(true)}
            attemptId={attemptId}
          />
        </div>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-3 md:p-4">
            <QuestionWorkspace
              attemptId={attemptId}
              sections={sections}
              activeQuestionId={activeId}
              onNavigate={handleNavigate}
              state={state}
            />

            {/* MOBILE GRID FALLBACK */}
            {/* <div className="min-[820px]:hidden">
              <QuestionGrid
                sections={mappedSections}
                onJump={handleNavigate}
                activeId={activeId}
              />
            </div> */}
          </div>
        </main>

        {/* SIDE GRID */}
        <aside className="hidden h-[calc(100vh-101.6px)] w-82.5 border-l bg-background min-[820px]:block">
          <div className="sticky top-0 h-full overflow-y-auto p-4">
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
        <DrawerContent className="h-[90vh] data-[vaul-drawer-direction=bottom]:max-h-[90vh] rounded-t-3xl border-x-0 border-b-0 ">
          {/* Accessibility */}
          <DrawerHeader>
            <DrawerTitle className="sr-only">Question navigator</DrawerTitle>
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
