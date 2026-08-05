"use client";

import { useTestSubmit } from "../hooks/use-test-submit";
import {
  CachedTestPayload,
  Section,
} from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
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
  testPayload: CachedTestPayload;
  expiresAt: string;
  state: StateItem[];
};
export default function ExamClient({
  attemptId,
  testPayload,
  expiresAt,
  state,
}: Props) {
  const timer = useQuestionTimeTracker(attemptId);
  const testSubmission = useTestSubmit(attemptId, timer);

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<CenteredLoader />}>
        <ExamHeader
          testTitle={testPayload.title}
          expiresAt={expiresAt}
          onAutoSubmit={() => testSubmission.submitTest("auto")}
        />

        <ExamShell
          attemptId={attemptId}
          testPayload={testPayload}
          state={state}
          testSubmission={testSubmission}
          timer={timer}
        />
      </Suspense>
    </div>
  );
}
