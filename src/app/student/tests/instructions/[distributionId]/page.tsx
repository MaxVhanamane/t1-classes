import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { Card, CardContent } from "@/src/components/ui/card";
import { Lock, AlertTriangle } from "lucide-react";
import { PageData } from "./_features/types/test-instructions.types";
import GeneralInstructions from "./_features/components/general-instructions";
import SectionInstructions from "./_features/components/section-instructions";
import StartGate from "./_features/components/start-gate";

async function fetchInstructions(
  distributionId: string,
): Promise<PageData | null> {
  const supabase = await createServerSupabaseClient();

  const { data: dist } = await supabase
    .from("test_distributions")
    .select("id, test_id, starts_at, ends_at")
    .eq("id", distributionId)
    .single();

  if (!dist) return null;

  const now = new Date();
  const startsAt = new Date(dist.starts_at);
  const endsAt = new Date(dist.ends_at);

  let status: PageData["status"] = "ongoing";
  if (now < startsAt) status = "scheduled";
  else if (now > endsAt) status = "ended";

  const { data: attempt } = await supabase
    .from("test_attempts")
    .select("id, status")
    .eq("distribution_id", distributionId)
    .eq("status", "in_progress")
    .single();

  const { data: sections } = await supabase
    .from("test_sections")
    .select(
      `
      id,
      title,
      description,
      answer_mode,
      full_marks,
      negative_marks,
      partial_marks,
      max_selections,
      subject_label
    `,
    )
    .eq("test_id", dist.test_id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return {
    distribution: dist,
    status,
    attempt: attempt ?? null,
    sections: sections ?? [],
  };
}

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{ distributionId: string }>;
}) {
  const distributionId = (await params).distributionId;
  const data = await fetchInstructions(distributionId);
  if (!data) notFound();

  const { status, attempt, sections } = data;

  if (attempt?.status === "in_progress") {
    redirect(`/student/tests/attempt/${attempt.id}`);
  }

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
          <CardContent className="flex items-center gap-3 py-4 text-yellow-700 dark:text-yellow-300">
            <Lock className="h-5 w-5" />
            This test has not started yet.
          </CardContent>
        </Card>
      )}

      {status === "ended" && (
        <Card className="border-red-400/40 bg-red-50 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 py-4 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            This test has already ended.
          </CardContent>
        </Card>
      )}

      <GeneralInstructions />

      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionInstructions
            key={section.id}
            section={section}
            index={index}
          />
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <StartGate
          distributionId={distributionId}
          disabled={status !== "ongoing"}
        />
      </div>
    </div>
  );
}
