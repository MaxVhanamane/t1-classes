"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser";

export type CourseAccess = {
    hasAccess: boolean;
    via: "course" | "batch" | null;
};

export async function getCourseAccess(courseId: string): Promise<CourseAccess> {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
        return { hasAccess: false, via: null };
    }

    const now = new Date().toISOString();

    /* -----------------------------------------------------------
     * 1. Direct course enrollment check
     * --------------------------------------------------------- */
    const { count: courseCount, error: courseError } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("target_type", "course")
        .eq("course_id", courseId)
        .in("status", ["ongoing", "paused"])
        .lte("access_starts_at", now)
        .or(`access_ends_at.is.null,access_ends_at.gte.${now}`);

    if (courseError) {
        throw new Error(courseError.message);
    }

    if ((courseCount ?? 0) > 0) {
        return { hasAccess: true, via: "course" };
    }

    /* -----------------------------------------------------------
     * 2. Batch enrollment check (two-step, efficient & correct)
     * --------------------------------------------------------- */

    // Step A: find batches that include this course
    const { data: batchRows, error: batchCoursesError } = await supabase
        .from("batch_courses")
        .select("batch_id")
        .eq("course_id", courseId);

    if (batchCoursesError) {
        throw new Error(batchCoursesError.message);
    }

    if (!batchRows || batchRows.length === 0) {
        return { hasAccess: false, via: null };
    }

    const batchIds = batchRows.map((b) => b.batch_id);

    // Step B: check enrollment in those batches
    const { count: batchCount, error: batchEnrollError } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("target_type", "batch")
        .in("batch_id", batchIds)
        .in("status", ["ongoing", "paused"])
        .lte("access_starts_at", now)
        .or(`access_ends_at.is.null,access_ends_at.gte.${now}`);

    if (batchEnrollError) {
        throw new Error(batchEnrollError.message);
    }

    if ((batchCount ?? 0) > 0) {
        return { hasAccess: true, via: "batch" };
    }

    return { hasAccess: false, via: null };
}
