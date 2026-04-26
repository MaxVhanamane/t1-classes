"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuth } from "../../auth/get-auth";

export type CourseAccess = {
    hasAccess: boolean;
    via: "course" | "batch" | null;
};

export async function getCourseAccess(
    courseId: string,
): Promise<CourseAccess> {
    const supabase = await createServerSupabaseClient();
    const user = await getAuth();

    if (!user) {
        return {
            hasAccess: false,
            via: null,
        };
    }

    const now = new Date().toISOString();

    /* -----------------------------------------------------------
     * 1. Direct course enrollment check
     * --------------------------------------------------------- */

    const {
        count: courseCount,
        error: courseError,
    } = await supabase
        .from("enrollments")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("user_id", user.userId)
        .eq("target_type", "course")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .lte("access_starts_at", now)
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${now}`,
        );

    if (courseError) {
        throw new Error(
            courseError.message,
        );
    }

    if (
        (courseCount ?? 0) >
        0
    ) {
        return {
            hasAccess: true,
            via: "course",
        };
    }

    /* -----------------------------------------------------------
     * 2. Batch enrollment check
     * --------------------------------------------------------- */

    const {
        data: batchRows,
        error: batchCoursesError,
    } = await supabase
        .from("batch_courses")
        .select("batch_id")
        .eq("course_id", courseId);

    if (batchCoursesError) {
        throw new Error(
            batchCoursesError.message,
        );
    }

    if (
        !batchRows ||
        batchRows.length === 0
    ) {
        return {
            hasAccess: false,
            via: null,
        };
    }

    const batchIds = batchRows.map(
        (row) => row.batch_id,
    );

    const {
        count: batchCount,
        error: batchEnrollError,
    } = await supabase
        .from("enrollments")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("user_id", user.userId)
        .eq("target_type", "batch")
        .in("batch_id", batchIds)
        .eq("is_active", true)
        .lte("access_starts_at", now)
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${now}`,
        );

    if (batchEnrollError) {
        throw new Error(
            batchEnrollError.message,
        );
    }

    if (
        (batchCount ?? 0) >
        0
    ) {
        return {
            hasAccess: true,
            via: "batch",
        };
    }

    return {
        hasAccess: false,
        via: null,
    };
}
