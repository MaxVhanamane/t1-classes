import "server-only";

import type {
    MyEnrollment,
    CourseEnrollment,
    BatchEnrollment,
    RawEnrollmentRow,
} from "@/src/lib/services/enrollments/types";

import { SupabaseClient } from "@supabase/supabase-js";

export async function getMyEnrollmentsService(
    supabase: SupabaseClient,
    userId: string,
): Promise<MyEnrollment[]> {
    const nowIso = new Date().toISOString();

    const {
        data,
        error,
    } = await supabase
        .from("enrollments")
        .select(
            `
      id,
      target_type,
      is_active,
      access_starts_at,
      access_ends_at,

      course:course_id (
        id,
        title,
        slug,
        category,
        is_active,
        subtitle,
        class_level,
        board,
        target_exam,
        subjects,
        languages
      ),

      batch:batch_id (
        id,
        title,
        subtitle,
        slug,
        mode,
        start_date,
        end_date,
        is_active,
        category,
        class_level,
        board,
        target_exam,
        subjects,
        languages
      )
    `,
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .lte("access_starts_at", nowIso)
        .or(`access_ends_at.is.null,access_ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching enrollments:", error);
        throw new Error("Failed to fetch enrollments");
    }

    if (!data || data.length === 0) {
        return [];
    }

    const rows = data as unknown as RawEnrollmentRow[];
    const result: MyEnrollment[] = [];

    for (const e of rows) {
        /* =====================================
           Course Enrollment
        ===================================== */
        const course = Array.isArray(e.course) ? e.course[0] ?? null : e.course;

        if (e.target_type === "course" && course?.is_active) {
            result.push({
                enrollmentId: e.id,
                targetType: "course",
                isActive: e.is_active,
                accessStartsAt: e.access_starts_at,
                accessEndsAt: e.access_ends_at,
                course: {
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    category: course.category,
                    subtitle: course.subtitle,
                    class_level: course.class_level,
                    board: course.board,
                    target_exam: course.target_exam,
                    subjects: course.subjects,
                    languages: course.languages || [],
                },
            } satisfies CourseEnrollment);
            continue;
        }

        /* =====================================
           Batch Enrollment
        ===================================== */
        const batch = Array.isArray(e.batch) ? e.batch[0] ?? null : e.batch;

        if (e.target_type === "batch" && batch?.is_active) {
            result.push({
                enrollmentId: e.id,
                targetType: "batch",
                isActive: e.is_active,
                accessStartsAt: e.access_starts_at,
                accessEndsAt: e.access_ends_at,
                batch: {
                    id: batch.id,
                    title: batch.title,
                    subtitle: batch.subtitle,
                    slug: batch.slug,
                    mode: batch.mode,
                    start_date: batch.start_date,
                    end_date: batch.end_date,
                    category: batch.category,
                    class_level: batch.class_level,
                    board: batch.board,
                    target_exam: batch.target_exam,
                    subjects: batch.subjects,
                    languages: batch.languages || [],
                },
            } satisfies BatchEnrollment);
        }
    }

    return result;
}
