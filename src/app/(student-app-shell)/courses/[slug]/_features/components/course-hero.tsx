import Image from "next/image";
import { CourseDetails } from "../types/course-details.types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { CheckCircle2 } from "lucide-react";
import { CourseCTA } from "./course-cta";

type Props = {
  course: CourseDetails;
};

export function CourseHero({ course }: Props) {
  return (
    <section className="grid gap-10 lg:grid-cols-2 items-start">
      {/* LEFT COLUMN */}

      <div className="space-y-6">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
          {course.thumbnailImage && (
            <Image
              src={`${R2_BUCKET_PUBLIC_URL}/${course.thumbnailImage}`}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* CTA directly under image */}
        <CourseCTA
          sale_price={course.sale_price}
          list_price={course.list_price}
          courseId={course.id}
          courseTitle={course.title}
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-8">
        {/* Title + Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {course.title}
          </h1>

          {course.subtitle && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {course.subtitle}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
          {course.classLevel && (
            <div>
              <p className="text-muted-foreground">Class</p>
              <p className="font-medium">Class {course.classLevel}</p>
            </div>
          )}

          {course.board && (
            <div>
              <p className="text-muted-foreground">Board</p>
              <p className="font-medium">{course.board}</p>
            </div>
          )}

          {course.targetExam && (
            <div>
              <p className="text-muted-foreground">Target Exam</p>
              <p className="font-medium">{course.targetExam}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">Course Type</p>
            <p className="font-medium capitalize">{course.courseType}</p>
          </div>

          {/* Subjects — Horizontal */}
          {course.subjects && course.subjects?.length > 0 && (
            <SubjectsRow subjects={course.subjects} />
          )}
        </div>

        {/* Learning Outcomes */}
        {course.learning_outcomes && course.learning_outcomes?.length > 0 && (
          <LearningOutcomes outcomes={course.learning_outcomes} />
        )}
      </div>
    </section>
  );
}

function SubjectsRow({ subjects }: { subjects: string[] }) {
  const single = subjects.length === 1;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Subjects Covered</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {subjects.map((subject) => (
          <div key={subject} className="flex items-center gap-2">
            {/* Dot only if multiple */}
            {!single && (
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            )}

            <span className="font-medium text-foreground/90">{subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningOutcomes({ outcomes }: { outcomes: string[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">What You’ll Learn</h2>
        <p className="text-sm text-muted-foreground">
          By the end of this course, you will be able to:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {outcomes.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-primary/90" />

            <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
