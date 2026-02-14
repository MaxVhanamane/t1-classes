import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import ExamShell from "./_features/components/exam-shell";
import ExamHeader from "./_features/components/exam-header";

import AttemptDeniedCard from "./_features/components/attempt-denied-card";
import { LoadAttemptResponse } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/tests/attempts/${attemptId}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  );

  // Only treat true server failures as fatal
  if (!res.ok && res.status >= 500) {
    notFound();
  }

  const data: LoadAttemptResponse = await res.json();

  if (data.kind === "denied") {
    return <AttemptDeniedCard reason={data.reason} />;
  }

  return (
    <div className="flex flex-col">
      <ExamHeader
        studentName="Student"
        testTitle={data.test.title}
        expiresAt={data.expiresAt}
      />

      <ExamShell
        attemptId={attemptId}
        sections={data.test.sections}
        state={data.state}
      />
    </div>
  );
}
