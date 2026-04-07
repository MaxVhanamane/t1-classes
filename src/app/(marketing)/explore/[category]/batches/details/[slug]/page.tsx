import { notFound } from "next/navigation";

import type { ExploreBatchDetail } from "@/src/app/api/explore-batches/[slug]/types";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { getExploreBatchDetailBySlugService } from "@/src/lib/services/batches/get-explore-batch-details-by-slug-service";
import { BatchHero } from "./_features/components/batch-hero";
import { BatchCoursesSection } from "./_features/components/batch-courses-section";
import { BatchTargetAudienceSection } from "./_features/components/batch-target-audience";
import { BatchFinalCTA } from "./_features/components/batch-final-cta";
import { BatchDescriptionSection } from "./_features/components/batch-description-section";
import { BatchTestsSection } from "./_features/components/batch-test-section";
import { BatchLiveClassesSection } from "./_features/components/batch-live-classes-section";
import { BatchFAQSection } from "./_features/components/batch-faq-section";
import { InstructorsSection } from "@/src/components/instructors/instructors-section";
import { SectionDivider } from "../../../../../../../components/ui/section-divider";
import { cacheLife } from "next/cache";

// export const revalidate = false; // never revalidate — permanent static

/* -------------------------------------------------------------------------- */
/* Data Fetch                                                                  */
/* -------------------------------------------------------------------------- */

async function getBatch(slug: string): Promise<ExploreBatchDetail | null> {
  console.log("get batch called");
  const supabase = createStaticSupabaseClient();
  return await getExploreBatchDetailBySlugService(supabase, slug);
}

/* -------------------------------------------------------------------------- */
/* Static Params                                                               */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();

  const { data, error } = await supabase
    .from("batches")
    .select("slug, category")
    .eq("is_active", true);

  if (error || !data || data.length === 0) {
    return [{ slug: "__placeholder__", category: "__placeholder__" }];
  }

  console.log(
    data.map((b) => ({
      slug: b.slug,
      category: b.category, //  REQUIRED
    })),
  );
  return data.map((b) => ({
    slug: b.slug,
    category: b.category, //  REQUIRED
  }));
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function BatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife({ stale: 60 * 5, revalidate: 60 * 10 });
  console.log("Cached Batch page rendered");
  const { slug } = await params;
  if (slug === "__placeholder__") notFound();
  const batch = await getBatch(slug);

  if (!batch) notFound();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        <BatchHero batch={batch} />
        <SectionDivider />

        <BatchCoursesSection courses={batch.courses} />
        <SectionDivider />
        <BatchTestsSection />

        <SectionDivider />
        <BatchLiveClassesSection />

        <SectionDivider />
        <BatchDescriptionSection description={batch.description} />

        {batch.target_audience && batch.target_audience.length > 0 && (
          <>
            <SectionDivider />
            <BatchTargetAudienceSection audience={batch.target_audience} />
          </>
        )}

        <InstructorsSection type="batch" id={batch.id} />
        <SectionDivider />
        <BatchFAQSection />
        <SectionDivider />
        <BatchFinalCTA batch={batch} />
      </div>
    </div>
  );
}
