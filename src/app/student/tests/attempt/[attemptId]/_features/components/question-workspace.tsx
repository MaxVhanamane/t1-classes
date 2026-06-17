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
import { getAnswerModeLabel } from "../helpers/question-map";
import { ShortDivider } from "@/src/components/ui/divider/short-divider";
import { MobileActionLayout } from "../hooks/use-mobile-action-layout";

type Props = {
  attemptId: string;
  sections: Section[];
  state: StateItem[];
  activeQuestionId: string;
  onNavigate: (id: string) => void;
  testSubmission: ReturnType<typeof useTestSubmit>;
  layoutMode: MobileActionLayout;
};

export default function QuestionWorkspace({
  attemptId,
  sections,
  activeQuestionId,
  onNavigate,
  state,
  testSubmission,
  layoutMode,
}: Props) {
  const session = useQuestionSession({
    attemptId,
    sections,
    activeQuestionId,
    onNavigate,
    state,
  });

  const syncStatus = useSyncStatus(attemptId);

  const [draft, setDraft] = useState<unknown | null>(null);

  const serverAnswer = session.answerState?.answer ?? null;
  const answerMode = session.current.section.answerMode;
  useEffect(() => {
    const uiValue = serverAnswer
      ? denormalizeStudentAnswer(answerMode, serverAnswer)
      : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(uiValue);
  }, [session.current?.id, serverAnswer, answerMode]);

  if (!session.current) return null;
  const isFixedLayout = layoutMode === "fixed";

  return (
    <>
      <SubmitOverlay
        visible={testSubmission.locked}
        failed={testSubmission.failed}
        onRetry={() => testSubmission.submitTest("manual")}
      />

      <Card className="relative flex flex-col pt-0 min-[820px]:pt-7 h-full rounded-md border-0 min-[820px]:border bg-background min-[820px]:bg-muted-soft gap-2 min-[820px]:gap-4 pb-0 min-[820px]:pb-3">
        {/* Sync */}
        <div className="absolute top-2 right-2 items-center justify-start min-w-18.75 hidden min-[820px]:flex">
          <SyncDot status={syncStatus} />
        </div>

        {/* Header */}
        <CardHeader className="shrink-0 space-y-2 px-0 min-[820px]:px-6">
          <div className=" items-center justify-between gap-3 hidden min-[820px]:flex">
            <div className="line-clamp-2 text-sm font-semibold">
              {session.current.section.title}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Question position */}
            <div className="font-medium text-foreground text-xs min-[820px]:text-sm">
              <span className="min-[820px]:hidden rounded-full border bg-card px-3 py-1 shadow-sm">
                Q {session.index + 1}/{session.flat.length}
              </span>

              <span className="hidden min-[820px]:inline">
                Question {session.index + 1} of {session.flat.length}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <span className="font-medium text-foreground">Type:</span>{" "}
                {getAnswerModeLabel(session.current.section.answerMode)}
              </div>

              <div className="rounded-full border bg-card px-3 py-1 text-xs shadow-sm">
                <span className="font-medium text-foreground">Marks:</span>{" "}
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  +{session.current.section.fullMarks}
                </span>
                <span className="mx-2 text-muted-foreground min-[820px]:hidden">
                  /
                </span>
                <span className="mx-2 hidden text-muted-foreground min-[820px]:inline">
                  •
                </span>
                <span className="font-medium text-rose-700 dark:text-rose-400">
                  {session.current.section.negativeMarks}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center justify-center min-[820px]:hidden">
          <ShortDivider className=" w-52" />
        </div>
        <Separator className="hidden min-[820px]:block" />

        {/* Content */}
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 min-[820px]:px-6 py-0">
          {/* Question Body */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin pb-3">
            <QuestionBody
              question={session.current}
              section={session.current.section}
              value={draft}
              onChange={setDraft}
            />
            {!isFixedLayout && (
              <div className="shrink-0 pt-4">
                <QuestionActions
                  disabled={testSubmission.locked}
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
                      toast.warning(
                        "Select an answer to save & mark for review",
                      );
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
                  onSubmit={() => testSubmission.submitTest("manual")}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          {isFixedLayout && (
            <div className="shrink-0 pt-4">
              <QuestionActions
                disabled={testSubmission.locked}
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
                onSubmit={() => testSubmission.submitTest("manual")}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
