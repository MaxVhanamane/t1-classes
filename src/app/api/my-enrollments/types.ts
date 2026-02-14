export type RawEnrollmentRow = {
    id: string
    target_type: "course" | "batch"
    status: "ongoing" | "paused" | "completed" | "cancelled"
    access_starts_at: string
    access_ends_at: string | null

    course: {
        id: string
        title: string
        slug: string
        thumbnail_image: string | null
        course_type: string
    } | null

    batch: {
        id: string
        name: string
        mode: "online" | "offline" | "hybrid"
        schedule: string | null
        status: "upcoming" | "ongoing" | "completed" | "cancelled"
    } | null
}

export type RawBatchCourseRow = {
    batch_id: string
    course: {
        id: string
        title: string
    } | null
}


// Enrollment target types

export type EnrollmentTargetType = "course" | "batch"

// Common enrollment fields
interface BaseEnrollment {
    enrollmentId: string
    targetType: EnrollmentTargetType
    accessStartsAt: string
    accessEndsAt: string | null
    status: "ongoing" | "paused" | "completed" | "cancelled"
}

/**
 * Course enrollment card
 */
export interface CourseEnrollment extends BaseEnrollment {
    targetType: "course"
    course: {
        id: string
        title: string
        slug: string
        thumbnailImage: string | null
        courseType: string
    }
}

/**
 * Batch enrollment card
 */
export interface BatchEnrollment extends BaseEnrollment {
    targetType: "batch"
    batch: {
        id: string
        name: string
        mode: "online" | "offline" | "hybrid"
        schedule: string | null
        status: "upcoming" | "ongoing" | "completed" | "cancelled"
        courses: {
            id: string
            title: string
        }[]
    }
}

/**
 * Union used by UI
 */
export type MyEnrollment = CourseEnrollment | BatchEnrollment
