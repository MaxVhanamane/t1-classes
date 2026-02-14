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

  // Load saved answer into UI
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

      <Card className="flex h-auto flex-col lg:h-full">
        {/* HEADER */}
        <CardHeader className="shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-semibold">
              {session.current.section.title}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                +{session.current.section.fullMarks} /{" "}
                {session.current.section.negativeMarks}
              </div>
              <SyncDot status={syncStatus} />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Question {session.index + 1} of {session.flat.length}
          </div>
        </CardHeader>

        <Separator />

        {/* BODY */}
        <CardContent className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="flex-1 overflow-y-auto pr-1">
            <QuestionBody
              question={session.current}
              section={session.current.section}
              value={draft}
              onChange={setDraft}
            />
          </div>

          <div className="shrink-0 pt-3">
            <QuestionActions
              disabled={submit.locked}
              isFirst={session.isFirst}
              isLast={session.isLast}
              onBack={session.goBack}
              onNext={session.goNext}
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
