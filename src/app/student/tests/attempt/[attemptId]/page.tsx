import { notFound } from "next/navigation";

import ExamShell from "./_features/components/exam-shell";
import ExamHeader from "./_features/components/exam-header";
import AttemptDeniedCard from "./_features/components/attempt-denied-card";
import { loadAttempt } from "./_features/server/load-attempt";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  let data;
  try {
    data = await loadAttempt(attemptId);
  } catch {
    notFound();
  }

  if (data.kind === "denied") {
    return <AttemptDeniedCard reason={data.reason} />;
  }

  return (
    <div className="flex flex-col">
      <ExamHeader testTitle={data.test.title} expiresAt={data.expiresAt} />
      <ExamShell
        attemptId={attemptId}
        sections={data.test.sections}
        state={data.state}
      />
    </div>
  );
}
