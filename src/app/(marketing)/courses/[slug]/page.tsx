import { cookies } from "next/headers";

import type { CourseOutline } from "@/src/types/course-outline.types";
import { CourseErrorState } from "../../../(student-app-shell)/learn/courses/[slug]/_features/components/course-error-state";
import { CourseDetails } from "./_features/types/course-details.types";
import { CourseHero } from "./_features/components/course-hero";
import { CurriculumPreviewSection } from "./_features/components/curriculum-preview-section";
import { CoursePlayer } from "../../../(student-app-shell)/learn/courses/[slug]/_features/components/course-player";
import { CourseDescriptionSection } from "./_features/components/course-description-section";
import { SectionDivider } from "./_features/components/section-divider";
import { InstructorsSection } from "@/src/components/instructors/instructors-section";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CourseLandingPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const [detailsRes, outlineRes] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/marketing/courses/${slug}/details`,
      {
        headers: { cookie: cookieStore.toString() },
      },
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/marketing/courses/${slug}/outline`,
      {
        headers: { cookie: cookieStore.toString() },
      },
    ),
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
    <div className="min-h-screen bg-background ">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        <CourseHero course={course} />
        <SectionDivider />

        <CurriculumPreviewSection>
          <CoursePlayer outline={outline} mode="preview" />
        </CurriculumPreviewSection>
        {(course.description || course.target_audience) && <SectionDivider />}
        {(course.description || course.target_audience) && (
          <CourseDescriptionSection
            description={course.description}
            target_audience={course.target_audience}
          />
        )}
        <InstructorsSection type="course" id={course.id} />
      </div>
    </div>
  );
}
