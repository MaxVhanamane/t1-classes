import {
  BatchOption,
  BatchSupabaseRow,
  CourseSupabaseRow,
  EnrollmentRow,
  EnrollmentSupabaseRow,
} from "./_features/types/enrollments";
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
      is_active,
      notes,
      deactivation_reason,
      created_at,
      access_starts_at,
      access_ends_at,

user:users!enrollments_user_id_fkey (
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
        title,
        batch_courses (
          course:courses (
            id,
            title
          )
        )
      )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(50)
    .overrideTypes<EnrollmentSupabaseRow[], { merge: false }>();

  if (error) {
    throw new Error(error.message);
  }

  const enrollments: EnrollmentRow[] =
    (data as EnrollmentSupabaseRow[] | null)?.map((e) => ({
      id: e.id,

      target_type: e.target_type,

      enrollment_type: e.enrollment_type,

      registration_channel: e.registration_channel,

      is_active: e.is_active,

      notes: e.notes,

      deactivation_reason: e.deactivation_reason,

      created_at: e.created_at,

      access_starts_at: e.access_starts_at,

      access_ends_at: e.access_ends_at,

      user: e.user,

      course: e.course,

      batch: e.batch
        ? {
            id: e.batch.id,
            title: e.batch.title,

            courses: e.batch.batch_courses.map((bc) => ({
              id: bc.course.id,
              title: bc.course.title,
            })),
          }
        : null,
    })) ?? [];

  const today = new Date().toISOString();

  const [{ data: batches }, { data: courses }] = await Promise.all([
    supabase
      .from("batches")
      .select(
        `
        id,
        title,
        is_active,
        start_date,
        end_date,
        is_admission_open,
        batch_courses (
          course:courses (
            id,
            title
          )
        )
        `,
      )
      .eq("is_active", true)
      .eq("is_admission_open", true)
      .or(
        `start_date.gt.${today},and(start_date.lte.${today},end_date.gte.${today})`,
      )
      .order("start_date", {
        ascending: true,
      })
      .overrideTypes<BatchSupabaseRow[], { merge: false }>(),

    supabase
      .from("courses")
      .select(
        `
        id,
        title,
        is_active
        `,
      )
      .eq("is_active", true)
      .order("title")
      .overrideTypes<CourseSupabaseRow[], { merge: false }>(),
  ]);

  const batchOptions: BatchOption[] = (batches ?? []).map((b) => ({
    id: b.id,
    title: b.title,

    start_date: b.start_date,

    end_date: b.end_date,

    course: b.batch_courses.map((bc) => ({
      title: bc.course.title,
    })),

    is_active: b.is_active,

    is_admission_open: b.is_admission_open,
  }));

  return (
    <div className="space-y-6">
      <EnrollmentsClient
        enrollments={enrollments}
        batches={batchOptions}
        courses={courses ?? []}
      />
    </div>
  );
}
