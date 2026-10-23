import { notFound } from "next/navigation";
import type { CourseOutline } from "@/src/types/course-outline.types";
import type { CourseDetails } from "./types/course-details.types";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { CourseHero } from "./components/course-hero";
import { SectionDivider } from "../../../../../../../components/ui/section-divider";
import { CurriculumPreviewSection } from "./components/curriculum-preview-section";
import { CoursePlayer } from "@/src/app/student/learn/courses/[slug]/_features/components/course-player";
import { CourseDescriptionSection } from "./components/course-description-section";
import { InstructorsSection } from "@/src/components/instructors/instructors-section";
import { getCourseBySlug } from "@/src/app/api/marketing/courses/[slug]/details/server/get-course-by-slug";
import { cacheLife, cacheTag } from "next/cache";

// export const revalidate = false;

/* -------------------------------------------------------------------------- */
/* Data Fetch                                                                  */
/* -------------------------------------------------------------------------- */

async function getCourse(slug: string): Promise<CourseDetails | null> {
  const supabase = createStaticSupabaseClient();
  return await getCourseBySlug(slug, supabase);
}

async function getOutline(slug: string): Promise<CourseOutline | null> {
  const supabase = createStaticSupabaseClient();

  const { data, error } = await supabase.rpc(
    "get_marketing_course_outline_by_slug",
    { p_slug: slug },
  );

  if (error) return null;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Static Params                                                               */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("slug, category")
    .eq("is_active", true);

  if (error || !data || data.length === 0) {
    return [{ slug: "__placeholder__", category: "__placeholder__" }];
  }

  return data.map((c) => ({ slug: c.slug, category: c.category }));
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }): Promise<Metadata> {
//   const { slug } = await params;

//   const course = await getCourse(slug);

//   if (!course) {
//     return {
//       title: "Course Not Found",
//       robots: { index: false, follow: false },
//     };
//   }

//   const title = `${course.title} | Learn at Your Own Pace`;
//   const description =
//     course.subtitle ??
//     `Master ${course.title} with structured lessons, videos, notes, and practice questions.`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: `/explore/${course.category}/courses/details/${slug}`,
//     },
//     openGraph: {
//       title,
//       description,
//       images: course.thumbnailImage
//         ? [
//             {
//               url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${course.thumbnailImage}`,
//               width: 1200,
//               height: 630,
//             },
//           ]
//         : [],
//     },
//   };
// }

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife("aggressive");
  const { slug } = await params;
  cacheTag(`course-detail-${slug}`);
  if (slug === "__placeholder__") notFound();
  const [course, outline] = await Promise.all([
    getCourse(slug),
    getOutline(slug),
  ]);

  if (!course || !outline) notFound();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        <CourseHero course={course} />

        <SectionDivider />

        <CurriculumPreviewSection>
          <CoursePlayer outline={outline} mode="preview" />
        </CurriculumPreviewSection>

        {(course.description || course.target_audience) && (
          <>
            <SectionDivider />
            <CourseDescriptionSection
              description={course.description}
              target_audience={course.target_audience}
            />
          </>
        )}

        <InstructorsSection type="course" id={course.id} />
      </div>
    </div>
  );
}
