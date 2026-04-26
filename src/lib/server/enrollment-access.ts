import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type EnrollmentAccessResult =
    | {
        hasAccess: true;
        enrollmentId: string;
        targetType: "course" | "batch";
        courseId?: string;
        batchId?: string;
    }
    | {
        hasAccess: false;
        reason: "not_enrolled" | "expired" | "inactive";
    };

export async function getEnrollmentAccess(
    supabase: SupabaseClient,
    userId: string,
    target:
        | {
            type: "course";
            courseId: string;
        }
        | {
            type: "batch";
            batchId: string;
        },
): Promise<EnrollmentAccessResult> {
    const now =
        new Date().toISOString();

    /* ---------------------------------------
       Base query
    --------------------------------------- */

    let query = supabase
        .from("enrollments")
        .select(
            `
      id,
      is_active,
      access_starts_at,
      access_ends_at,
      course_id,
      batch_id,
      target_type
    `,
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .lte("access_starts_at", now);

    /* ---------------------------------------
       Target filter
    --------------------------------------- */

    if (
        target.type === "course"
    ) {
        query = query
            .eq(
                "target_type",
                "course",
            )
            .eq(
                "course_id",
                target.courseId,
            );
    } else {
        query = query
            .eq(
                "target_type",
                "batch",
            )
            .eq(
                "batch_id",
                target.batchId,
            );
    }

    /* ---------------------------------------
       Access window
    --------------------------------------- */

    query = query.or(
        `access_ends_at.is.null,access_ends_at.gte.${now}`,
    );

    const {
        data,
        error,
    } = await query.maybeSingle();

    if (error || !data) {
        return {
            hasAccess: false,
            reason:
                "not_enrolled",
        };
    }

    return {
        hasAccess: true,
        enrollmentId:
            data.id,
        targetType:
            data.target_type,
        courseId:
            data.course_id ??
            undefined,
        batchId:
            data.batch_id ??
            undefined,
    };
}

/* =========================================
   Quick version
========================================= */

export async function hasActiveBatchEnrollment(
    supabase: SupabaseClient,
    userId: string,
    batchId: string,
): Promise<boolean> {
    const nowIso =
        new Date().toISOString();

    const {
        data,
        error,
    } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq(
            "target_type",
            "batch",
        )
        .eq(
            "batch_id",
            batchId,
        )
        .eq(
            "is_active",
            true,
        )
        .lte(
            "access_starts_at",
            nowIso,
        )
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${nowIso}`,
        )
        .maybeSingle();

    if (error || !data) {
        return false;
    }

    return true;
}
