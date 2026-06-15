"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { useQuestionSession } from "../hooks/use-question-session";
import { useSyncStatus } from "../hooks/use-sync-status";
import QuestionBody from "./question-body";
import QuestionActions from "./question-actions";
import SyncDot from "./sync-dot";
import { StateItem } from "../types/workspace.types";
import { denormalizeStudentAnswer } from "../helpers/denormalize-student-answer";
import { isEmptyAnswer } from "../helpers/is-empty-answer";
import { toast } from "sonner";
import { useTestSubmit } from "../hooks/use-test-submit";
import SubmitOverlay from "./submit-overlay";
import { cn } from "@/src/lib/utils";

type Props = {
  attemptId: string;
  sections: Section[];
  state: StateItem[];
  activeQuestionId: string;
  onNavigate: (id: string) => void;
};

export default function QuestionWorkspace({
  attemptId,
  sections,
  activeQuestionId,
  onNavigate,
  state,
}: Props) {
  const session = useQuestionSession({
    attemptId,
    sections,
    activeQuestionId,
    onNavigate,
    state,
  });

  const syncStatus = useSyncStatus(attemptId);
  const submit = useTestSubmit(attemptId);

  const [draft, setDraft] = useState<unknown | null>(null);

  useEffect(() => {
    const serverAnswer = session.answerState?.answer ?? null;

    const uiValue = serverAnswer
      ? denormalizeStudentAnswer(
          session.current.section.answerMode,
          serverAnswer,
        )
      : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(uiValue);
  }, [session.current?.id, session.answerState?.answer]);

  if (!session.current) return null;

  return (
    <>
      <SubmitOverlay
        visible={submit.locked}
        failed={submit.failed}
        onRetry={submit.submit}
      />

      <Card className="relative flex flex-col pt-0 min-[820px]:pt-7 lg:h-[calc(100vh-130px)] rounded-md border-0 min-[820px]:border bg-background min-[820px]:bg-muted-soft ">
        {/* Sync */}
        <div className="absolute top-2 right-2 items-center justify-start min-w-18.75 hidden min-[820px]:flex">
          <SyncDot status={syncStatus} />
        </div>

        {/* Header */}
        <CardHeader className="shrink-0 space-y-2 px-0 min-[820px]:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="line-clamp-2 text-sm font-semibold">
              {session.current.section.title}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Question {session.index + 1} of {session.flat.length}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span>+{session.current.section.fullMarks} correct</span>
              <span className="text-muted-foreground">•</span>
              <span>{session.current.section.negativeMarks} wrong</span>
            </div>
          </div>
        </CardHeader>

        <Separator className="hidden min-[820px]:block" />
        <div
          className={cn(
            "relative my-0 flex items-center justify-center min-[820px]:hidden",
          )}
        >
          <div className="h-px w-44 bg-border/40" />
          <div className="absolute h-1 w-12 rounded-full bg-border/80" />
        </div>

        {/* Content */}
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 min-[820px]:px-6 py-0 ">
          {/* Question Body */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <QuestionBody
              question={session.current}
              section={session.current.section}
              value={draft}
              onChange={setDraft}
            />
          </div>

          {/* Actions */}
          <div className="shrink-0 pt-4">
            <QuestionActions
              disabled={submit.locked}
              isFirst={session.isFirst}
              isLast={session.isLast}
              onBack={session.goBack}
              onNext={session.goNext}
              attemptId={attemptId}
              sections={sections}
              onClear={() => {
                setDraft(null);
                session.clearAnswer();
              }}
              onSaveAndNext={() => {
                if (isEmptyAnswer(draft)) {
                  toast.warning("Please select an answer before saving");
                  return;
                }

                session.saveAnswerAndNext(draft);
              }}
              onSaveAndMark={() => {
                if (isEmptyAnswer(draft)) {
                  toast.warning("Select an answer to save & mark for review");
                  return;
                }

                session.saveAnswerAndMarkForReview(draft);
              }}
              onMarkAndNext={() => {
                if (!isEmptyAnswer(draft)) {
                  toast.warning(
                    "Use Save & Mark for Review if you want to keep this answer",
                  );
                  return;
                }

                session.markForReviewAndNext();
              }}
              onSubmit={submit.submit}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
