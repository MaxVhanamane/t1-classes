import { notFound } from "next/navigation";
import AttemptDeniedCard from "./_features/components/attempt-denied-card";
import ExamClient from "./_features/components/exam-client";
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
    <ExamClient
      attemptId={attemptId}
      testPayload={data.test}
      expiresAt={data.expiresAt}
      state={data.state}
    />
  );
}
