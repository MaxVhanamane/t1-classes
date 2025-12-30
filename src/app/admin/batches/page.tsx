import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { BatchesClient } from "./_features/components/batches-client-wrapper";
import { BatchListItem, CourseSelectItem } from "./_features/types/types";

async function getCourses(): Promise<CourseSelectItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("is_active", true)
    .order("title")
    .overrideTypes<CourseSelectItem[], { merge: false }>();

  if (error) {
    throw new Error("Failed to load courses");
  }

  return data;
}

async function getBatches() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("batches")
    .select(
      `
    id,
    name,
    mode,
    status,
    is_active,
    description,
    admission_open,
    center_name,
    languages,
    start_date,
    end_date,
    duration,
    capacity,
    schedule,
    course_info:course_id (
      id,
      title
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
