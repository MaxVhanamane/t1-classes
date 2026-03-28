import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ExploreBatchDetail } from "@/src/app/api/explore-batches/[slug]/types";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { getExploreBatchDetailBySlugService } from "@/src/lib/services/batches/get-explore-batch-details-by-slug-service";
import { BatchHero } from "./_features/components/batch-hero";
import { SectionDivider } from "../../courses/[slug]/_features/components/section-divider";
import { BatchCoursesSection } from "./_features/components/batch-courses-section";
import { BatchTargetAudienceSection } from "./_features/components/batch-target-audience";
import { BatchFinalCTA } from "./_features/components/batch-final-cta";
import { BatchDescriptionSection } from "./_features/components/batch-description-section";
import { BatchTestsSection } from "./_features/components/batch-test-section";
import { BatchLiveClassesSection } from "./_features/components/batch-live-classes-section";
import { BatchFAQSection } from "./_features/components/batch-faq-section";
import { InstructorsSection } from "@/src/components/instructors/instructors-section";

export const revalidate = false; // never revalidate — permanent static

/* -------------------------------------------------------------------------- */
/* Data Fetch                                                                  */
/* -------------------------------------------------------------------------- */

async function getBatch(slug: string): Promise<ExploreBatchDetail | null> {
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
    .select("slug")
    .eq("is_active", true);

  if (error || !data) return [];

  return data.map((b) => ({ slug: b.slug }));
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const batch = await getBatch(slug);

  if (!batch) return { title: "Batch Not Found" };

  const title = `${batch.title} | Your Platform`;
  const description =
    batch.subtitle ?? `Join ${batch.title} and boost your preparation.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: batch.thumbnail_image
        ? [
            {
              url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${batch.thumbnail_image}`,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function BatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
