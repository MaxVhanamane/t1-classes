import { BatchMode } from "../explore-batches/types";
import type { Category } from "@/src/app/admin/batches/_features/zod-schema/schema";

/* -------------------------------------------------------------------------- */
/*                               Raw DB Rows                                  */
/* -------------------------------------------------------------------------- */

export type RawEnrollmentRow = {
    id: string;

    target_type: "course" | "batch";

    status:
    | "ongoing"
    | "paused"
    | "completed"
    | "cancelled";

    access_starts_at: string;
    access_ends_at: string;

    course: {
        id: string;
        title: string;
        slug: string;

        /* ---------- updated ---------- */
        category: Category;

        is_active: boolean;
    } | null;

    batch: {
        id: string;
        title: string;
        subtitle: string | null;
        slug: string;

        mode: BatchMode;

        start_date: string;
        end_date: string;

        admission_open: boolean;
        is_active: boolean;
    } | null;
};

export type RawBatchCourseRow = {
    batch_id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        is_active: boolean;
    } | null;
};

/* -------------------------------------------------------------------------- */
/*                             Enrollment Domain                              */
/* -------------------------------------------------------------------------- */

export type EnrollmentTargetType =
    | "course"
    | "batch";

interface BaseEnrollment {
    enrollmentId: string;
    targetType: EnrollmentTargetType;

    accessStartsAt: string;
    accessEndsAt: string;

    status:
    | "ongoing"
    | "paused"
    | "completed"
    | "cancelled";
}

/* -------------------------------------------------------------------------- */
/*                           Course Enrollment                                */
/* -------------------------------------------------------------------------- */

export interface CourseEnrollment
    extends BaseEnrollment {
    targetType: "course";

    course: {
        id: string;
        title: string;
        slug: string;

        /* ---------- updated ---------- */
        category: Category;
    };
}

/* -------------------------------------------------------------------------- */
/*                           Batch Enrollment                                 */
/* -------------------------------------------------------------------------- */

export interface BatchEnrollment {
    enrollmentId: string;
    targetType: "batch";

    status: string;

    accessStartsAt: string;
    accessEndsAt: string;

    batch: {
        id: string;
        title: string;
        subtitle: string | null;
        slug: string;

        mode: BatchMode;

        start_date: string;
        end_date: string;
    };
}

/* -------------------------------------------------------------------------- */
/*                              UI Union Type                                 */
/* -------------------------------------------------------------------------- */

export type MyEnrollment =
    | CourseEnrollment
    | BatchEnrollment;
