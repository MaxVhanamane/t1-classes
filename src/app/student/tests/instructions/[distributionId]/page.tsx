import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentServerOnly } from "@/src/lib/auth/require-role-server-only";

import GeneralInstructions from "./_features/components/general-instructions";
import SectionInstructions from "./_features/components/section-instructions";
import StartGate from "./_features/components/start-gate";

import {
  DistributionRow,
  SectionRow,
} from "./_features/types/test-instructions.types";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";

type CachedInstructionsPayload = {
  distribution: DistributionRow;

  sections: SectionRow[];
};

type DistributionStatus = "scheduled" | "ongoing" | "ended";

async function getCachedInstructionsPayload(
  distributionId: string,
): Promise<CachedInstructionsPayload | null> {
  "use cache: remote";

  cacheTag(`distribution:${distributionId}`);
  cacheLife("days");
  console.log("getCachedInstructionsPayload called");

  const supabase = createStaticSupabaseClient();

  const { data, error } = await supabase.rpc("get_test_instructions_payload", {
    p_distribution_id: distributionId,
  });

  if (error) {
    throw error;
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Test Instructions</h1>

        <p className="text-sm text-muted-foreground">
          Please review all rules before starting your test.
        </p>
      </div>

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
      <h2 className="text-lg font-semibold text-muted-foreground">
        General Instructions
      </h2>
      <GeneralInstructions />

      <h2 className="text-lg font-semibold text-muted-foreground">
        Section Instructions
      </h2>
      <div className="space-y-4">
        {payload.sections.map((section, index) => (
          <SectionInstructions
            key={section.id}
            section={section}
            index={index}
          />
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <StartGate distributionId={distributionId} disabled={startDisabled} />
      </div>
    </div>
  );
}
