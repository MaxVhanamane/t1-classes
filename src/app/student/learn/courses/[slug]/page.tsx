import { CoursePlayer } from "./_features/components/course-player";
import { CourseErrorState } from "./_features/components/course-error-state";
import { getCourseOutlineForPlayer } from "./_features/helper-functions/get-course-outline";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug: rawSlug } = await params;
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return <CourseErrorState status={400} message="Invalid course URL" />;
  }
  const result = await getCourseOutlineForPlayer(slug);

  if (!result.success) {
    return <CourseErrorState status={result.status} message={result.message} />;
  }

  return (
    <div className="pb-36">
      <CoursePlayer outline={result.outline} />
    </div>
  );
}

// mr-(--removed-body-scroll-bar-size) shadcn adds this when dialog,popover etc opens we can use this to avoid layout shift
