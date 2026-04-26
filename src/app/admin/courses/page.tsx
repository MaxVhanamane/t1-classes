import { getCourses } from "./_features/actions/get-courses";
import { CoursesClient } from "./_features/components/courses-client";

export default async function CoursesPage() {
  const courses = await getCourses();

  return <CoursesClient courses={courses} />;
}
