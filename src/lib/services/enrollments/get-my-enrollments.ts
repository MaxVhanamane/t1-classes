import "server-only";

import type {
    MyEnrollment,
    CourseEnrollment,
    BatchEnrollment,
    RawEnrollmentRow,
} from "@/src/app/api/my-enrollments/types";

import { SupabaseClient } from "@supabase/supabase-js";

export async function getMyEnrollmentsService(
    supabase: SupabaseClient,
    userId: string
): Promise<MyEnrollment[]> {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
        .from("enrollments")
        .select(`
      id,
      target_type,
      status,
      access_starts_at,
      access_ends_at,

      course:course_id (
        id,
        title,
        slug,
        category,
        is_active
      ),

      batch:batch_id (
        id,
        title,
        subtitle,
        slug,
        mode,
        start_date,
        end_date,
        is_active
      )
    `)
        .eq("user_id", userId)
        .eq("status", "ongoing")
        .lte("access_starts_at", nowIso)
        .or(`access_ends_at.is.null,access_ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching enrollments:", error);
        throw new Error("Failed to fetch enrollments");
    }

    if (!data || data.length === 0) return [];

    const result: MyEnrollment[] = [];

    for (const e of data as unknown as RawEnrollmentRow[]) {
        if (e.target_type === "course" && e.course?.is_active) {
            result.push({
                enrollmentId: e.id,
                targetType: "course",
                status: e.status,
                accessStartsAt: e.access_starts_at,
                accessEndsAt: e.access_ends_at,

                course: {
                    id: e.course.id,
                    title: e.course.title,
                    slug: e.course.slug,

                    /* ---------- updated ---------- */
                    category: e.course.category,
                },
            } satisfies CourseEnrollment);

            continue;
        }

        if (e.target_type === "batch" && e.batch?.is_active) {
            result.push({
                enrollmentId: e.id,
                targetType: "batch",
                status: e.status,
                accessStartsAt: e.access_starts_at,
                accessEndsAt: e.access_ends_at,

                batch: {
                    id: e.batch.id,
                    title: e.batch.title,
                    subtitle: e.batch.subtitle,
                    slug: e.batch.slug,
                    mode: e.batch.mode,
                    start_date: e.batch.start_date,
                    end_date: e.batch.end_date,
                },
            } satisfies BatchEnrollment);
        }
    }

    return result;
}
