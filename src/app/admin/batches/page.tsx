import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { BatchesClient } from "./_features/components/batches-client-wrapper";
import { BatchListItem, CourseSelectItem } from "./_features/types/types";

async function getCourses(): Promise<CourseSelectItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, is_active")
    .order("title")
    .overrideTypes<CourseSelectItem[], { merge: false }>();

  if (error) {
    throw new Error("Failed to load courses");
  }

  return data;
}

async function getBatches(): Promise<BatchListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("batches")
    .select(
      `
      id,
      name,
      description,
      mode,
      status,
      price,
      is_active,
      admission_open,
      center_name,
      batch_highlights,
      languages,
      start_date,
      end_date,
      duration,
      capacity,
      schedule,
      courses:batch_courses (
        course:courses (
          id,
          title
        )
      )
    `
    )
    .order("created_at", { ascending: false })
    .overrideTypes<BatchListItem[], { merge: false }>();

  if (error) {
    throw new Error("Failed to load batches");
  }

  return data;
}

export default async function AdminBatchesPage() {
  const [batches, courses] = await Promise.all([getBatches(), getCourses()]);

  return (
    <div className="space-y-6">
      <BatchesClient batches={batches} courses={courses} />
    </div>
  );
}
