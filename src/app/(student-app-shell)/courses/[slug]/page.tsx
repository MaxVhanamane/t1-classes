import { cookies } from "next/headers";

import type { CourseOutline } from "@/src/types/course-outline.types";
import { CourseErrorState } from "../../learn/courses/[slug]/_features/components/course-error-state";
import { CourseDetails } from "./_features/types/course-details.types";
import { CourseHero } from "./_features/components/course-hero";
import { CourseMetaStrip } from "./_features/components/course-meta-stripe";
import { CourseCTA } from "./_features/components/course-cta";
import { CurriculumPreviewSection } from "./_features/components/curriculum-preview-section";
import { CoursePlayer } from "../../learn/courses/[slug]/_features/components/course-player";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CourseLandingPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const [detailsRes, outlineRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/courses/${slug}/details`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/courses/${slug}/outline`, {
      cache: "no-store",
      headers: { cookie: cookieStore.toString() },
    }),
  ]);

  if (!detailsRes.ok || !outlineRes.ok) {
    const error = await outlineRes.json().catch(() => null);
    return (
      <CourseErrorState
        status={outlineRes.status}
        message={error?.message ?? "Failed to load course"}
      />
    );
  }

  const course: CourseDetails = await detailsRes.json();
  const outline: CourseOutline = await outlineRes.json();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        <CourseHero course={course} />

        <CourseMetaStrip course={course} />

        <CourseCTA
          price={course.price}
          hasAccess={outline.hasAccess}
          slug={course.slug}
        />

        <CurriculumPreviewSection>
          <CoursePlayer outline={outline} mode="preview" />
        </CurriculumPreviewSection>
      </div>
    </div>
  );
}
