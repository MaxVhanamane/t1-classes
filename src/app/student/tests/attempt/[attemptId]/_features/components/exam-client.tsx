"use client";

import { useTestSubmit } from "../hooks/use-test-submit";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { StateItem } from "../types/workspace.types";
import dynamic from "next/dynamic";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import { useQuestionTimeTracker } from "../hooks/use-question-time-tracker";
import { Suspense } from "react";

const ExamShell = dynamic(() => import("./exam-shell"), {
  ssr: false,
});
const ExamHeader = dynamic(() => import("./exam-header"), {
  ssr: false,
});

type Props = {
  attemptId: string;
  testTitle: string;
  expiresAt: string;
  sections: Section[];
  state: StateItem[];
};

export default function ExamClient({
  attemptId,
  testTitle,
  expiresAt,
  sections,
  state,
}: Props) {
  const timer = useQuestionTimeTracker(attemptId);
  const testSubmission = useTestSubmit(attemptId, timer);

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<CenteredLoader />}>
        <ExamHeader
          testTitle={testTitle}
          expiresAt={expiresAt}
          onAutoSubmit={() => testSubmission.submitTest("auto")}
        />

        <ExamShell
          attemptId={attemptId}
          sections={sections}
          state={state}
          testSubmission={testSubmission}
          timer={timer}
        />
      </Suspense>
    </div>
  );
}
