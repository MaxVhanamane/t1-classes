import { EnrollmentRow } from "./_features/types/enrollments";
import { EnrollmentsClient } from "./_features/components/enrollments-client";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export default async function AdminEnrollmentsPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
    id,
    target_type,
    enrollment_type,
    registration_channel,
    status,
    is_active,
    enrolled_at,
    access_starts_at,
    access_ends_at,

    user:users (
      id,
      full_name,
      phone
    ),

    course:courses (
      id,
      title,
      slug
    ),

    batch:batches (
      id,
      name,
      status,
      course:courses (
        title
      )
    )
  `
    )
    .order("enrolled_at", { ascending: false })
    .limit(50)
    .overrideTypes<EnrollmentRow[], { merge: false }>();

  const enrollments: EnrollmentRow[] = data ?? [];

  const [{ data: batches }, { data: courses }] = await Promise.all([
    supabase
      .from("batches")
      .select(
        `
      id,
      name,
      status,
      is_active,
      start_date,
      end_date,
      duration,
      admission_open,
      course:courses (
        title
      )
    `
      )
      .eq("is_active", true)
      .eq("admission_open", true)
      .in("status", ["upcoming", "ongoing"])
      .order("start_date", { ascending: true }),

    supabase
      .from("courses")
      .select(
        `
      id,
      title,
      is_active
    `
      )
      .eq("is_active", true)
      .order("title"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <EnrollmentsClient
        enrollments={enrollments ?? []}
        batches={batches ?? []}
        courses={courses ?? []}
      />
    </div>
  );
}
