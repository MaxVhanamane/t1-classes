"use client";

import { useTestSubmit } from "../hooks/use-test-submit";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { StateItem } from "../types/workspace.types";
import dynamic from "next/dynamic";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const ExamShell = dynamic(() => import("./exam-shell"), {
  ssr: false,

  loading: () => <CenteredLoader />,
});
const ExamHeader = dynamic(() => import("./exam-header"), {
  ssr: false,

  loading: () => <CenteredLoader />,
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
  const testSubmission = useTestSubmit(attemptId);

  return (
    <div className="flex flex-col h-full">
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
      />
    </div>
  );
}
