import { BatchMode } from "../../../app/(marketing)/explore/[category]/courses/page/[page]/_features/types/types";
import type { Category } from "@/src/app/admin/batches/_features/zod-schema/schema";

/* -------------------------------------------------------------------------- */
/*                               Raw DB Rows                                  */
/* -------------------------------------------------------------------------- */

export type RawEnrollmentRow = {
    id: string;

    target_type:
    | "course"
    | "batch";

    is_active: boolean;

    access_starts_at: string;

    access_ends_at:
    | string
    | null;

    course: {
        id: string;

        title: string;

        slug: string;

        category: Category;

        is_active: boolean;
    } | null;

    batch: {
        id: string;

        title: string;

        subtitle:
        | string
        | null;

        slug: string;

        mode: BatchMode;

        start_date: string;

        end_date: string;

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

    isActive: boolean;

    accessStartsAt: string;

    accessEndsAt:
    | string
    | null;
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

        category: Category;
    };
}

/* -------------------------------------------------------------------------- */
/*                           Batch Enrollment                                 */
/* -------------------------------------------------------------------------- */

export interface BatchEnrollment
    extends BaseEnrollment {
    targetType: "batch";

    batch: {
        id: string;

        title: string;

        subtitle:
        | string
        | null;

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
