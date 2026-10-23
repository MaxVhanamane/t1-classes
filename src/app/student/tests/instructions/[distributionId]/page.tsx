import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

import GeneralInstructions from "./_features/components/general-instructions";
import SectionInstructions from "./_features/components/section-instructions";
import StartGate from "./_features/components/start-gate";
import { TestOverviewCard } from "./_features/components/test-overview-card";

import {
  DistributionRow,
  SectionRow,
} from "./_features/types/test-instructions.types";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import { Accordion } from "@/src/components/ui/accordion";

// Updated Type to match the new RPC response
type CachedInstructionsPayload = {
  distribution: DistributionRow;
  test: {
    id: string;
    title: string;
    description: string | null;
    test_type: "standard" | "sectioned";
    total_marks: number;
    total_questions: number;
    total_sections: number;
  };
  sections: SectionRow[];
};

type DistributionStatus = "scheduled" | "ongoing" | "ended";

async function getCachedInstructionsPayload(
  distributionId: string,
): Promise<CachedInstructionsPayload | null> {
  "use cache: remote";

  cacheTag(`distribution:${distributionId}`);
  cacheLife("days");

  const supabase = createStaticSupabaseClient();

  const { data, error } = await supabase.rpc("get_test_instructions_payload", {
    p_distribution_id: distributionId,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message ?? "Failed to load test payload");
  }

  return data as CachedInstructionsPayload | null;
}

function getDistributionStatus(
  startsAt: string,
  endsAt: string,
): DistributionStatus {
  const nowMs = new Date().getTime();
  const startsAtMs = new Date(startsAt).getTime();
  const endsAtMs = new Date(endsAt).getTime();

  if (nowMs < startsAtMs) {
    return "scheduled";
  }

  if (nowMs >= endsAtMs) {
    return "ended";
  }

  return "ongoing";
}

function isAttemptStillActive(args: {
  startedAt: string;
  timeLimitSeconds: number;
  distributionEndsAt: string;
}) {
  const nowMs = new Date().getTime();

  const personalExpiryMs = Math.min(
    new Date(args.startedAt).getTime() + args.timeLimitSeconds * 1000,
    new Date(args.distributionEndsAt).getTime(),
  );

  return nowMs < personalExpiryMs;
}

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{
    distributionId: string;
  }>;
}) {
  const { distributionId } = await params;

  const user = await requireStudentServerOnly();
  const supabase = await createServerSupabaseClient();

  const [payload, attemptResult] = await Promise.all([
    getCachedInstructionsPayload(distributionId),
    supabase
      .from("test_attempts")
      .select(
        `
        id,
        status,
        started_at,
        time_limit_seconds
      `,
      )
      .eq("distribution_id", distributionId)
      .eq("user_id", user.userId)
      .eq("status", "in_progress")
      .maybeSingle(),
  ]);

  if (!payload) {
    notFound();
  }

  const attempt = attemptResult.data;

  if (
    attempt &&
    isAttemptStillActive({
      startedAt: attempt.started_at,
      timeLimitSeconds: attempt.time_limit_seconds,
      distributionEndsAt: payload.distribution.ends_at,
    })
  ) {
    redirect(`/student/tests/attempt/${attempt.id}`);
  }

  const status = getDistributionStatus(
    payload.distribution.starts_at,
    payload.distribution.ends_at,
  );

  const hasExpiredAttempt =
    !!attempt &&
    !isAttemptStillActive({
      startedAt: attempt.started_at,
      timeLimitSeconds: attempt.time_limit_seconds,
      distributionEndsAt: payload.distribution.ends_at,
    });

  const startsAtDate = new Date(payload.distribution.starts_at);
  const endsAtDate = new Date(payload.distribution.ends_at);
  const resultsAvailableAtDate = new Date(
    endsAtDate.getTime() + TEST_GRACE_TIME_IN_SECONDS * 1000,
  );
  const startsAtText = startsAtDate.toLocaleString();
  const endsAtText = endsAtDate.toLocaleString();
  const resultsAvailableAtText = resultsAvailableAtDate.toLocaleString();
  const startDisabled = status !== "ongoing" || hasExpiredAttempt;

  // 1. Group sections strictly by database subject_label
  const groupedSections = payload.sections.reduce(
    (acc, section, index) => {
      const subject = section.subject_label;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ section, globalIndex: index });
      return acc;
    },
    {} as Record<string, { section: SectionRow; globalIndex: number }[]>,
  );

  // 2. Extract unique subjects directly from the grouped keys
  const uniqueSubjects = Object.keys(groupedSections);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-3 sm:px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Test Instructions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review all rules and exam details before starting your test.
        </p>
      </div>

      {/* --- OVERVIEW CARD --- */}
      <TestOverviewCard
        test={payload.test}
        distribution={payload.distribution}
        subjects={uniqueSubjects}
      />

      {status === "scheduled" && (
        <Card className="border-yellow-400/40 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 text-yellow-700 dark:text-yellow-300">
                <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">This test has not started yet.</p>
                  <p className="mt-1 text-sm opacity-90">
                    Start time: {startsAtText}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "ended" && (
        <Card className="border-red-400/40 bg-red-50 dark:bg-red-950/30">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">This test has already ended.</p>
                  <p className="mt-1 text-sm opacity-90">
                    Ended on {endsAtText}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasExpiredAttempt && (
        <Card className="border-red-400/40 bg-red-50 dark:bg-red-950/30">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Your attempt has expired.</p>
                  <p className="mt-1 text-sm opacity-90">
                    Results will be available after the test window closes and
                    processing is completed.
                  </p>
                  <p className="mt-1 text-sm opacity-90">
                    Expected availability: {resultsAvailableAtText}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 pt-4">
        <h2 className="border-b pb-2 text-lg font-semibold text-foreground">
          General Instructions
        </h2>
        <GeneralInstructions />
      </div>

      <div className="space-y-6 pt-6">
        <h2 className="border-b pb-2 text-lg font-semibold text-foreground">
          Section Breakdown
        </h2>
        {/* Render Grouped Sections by Subject */}
        <div className="space-y-10">
          {Object.entries(groupedSections).map(
            ([subject, items], index, array) => (
              <div key={subject}>
                {/* Subject Content */}
                <div className="flex flex-col gap-4">
                  <h3 className="pl-1 text-xl font-bold capitalize tracking-tight text-foreground">
                    {subject}
                  </h3>

                  <Accordion type="multiple" className="space-y-4">
                    {items.map(({ section, globalIndex }) => (
                      <SectionInstructions
                        key={section.id}
                        section={section}
                        index={globalIndex}
                      />
                    ))}
                  </Accordion>
                </div>

                {/* Divider (Hidden on the last subject) */}
                {index < array.length - 1 && (
                  <div className="mt-10 h-px w-full bg-border/60" />
                )}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <StartGate distributionId={distributionId} disabled={startDisabled} />
      </div>
    </div>
  );
}
