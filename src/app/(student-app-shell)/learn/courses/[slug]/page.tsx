import { cookies } from "next/headers";
import { CoursePlayer } from "./_features/components/course-player";
import { CourseErrorState } from "./_features/components/course-error-state";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: Props) {
  const awaitedParams = await params;

  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/learning/courses/${awaitedParams.slug}/outline`,
    {
      cache: "no-store", // important for auth-based data
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    return (
      <CourseErrorState
        status={res.status}
        message={error?.message ?? "Something went wrong"}
      />
    );
  }

  const outline = await res.json();

  return (
    <div className="pb-36">
      <CoursePlayer outline={outline} />
    </div>
  );
}
