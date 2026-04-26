import { z } from "zod";

/* ========================================
   Enrollment Type
======================================== */

export const enrollmentTypeValues = [
    "standard",
    "scholarship",
    "trial",
    "internal",
] as const;

export const enrollmentTypeSchema =
    z.enum(enrollmentTypeValues);

export const enrollmentTypeOptions = [
    {
        value: "standard",
        label: "Standard",
    },
    {
        value: "scholarship",
        label: "Scholarship",
    },
    {
        value: "trial",
        label: "Trial",
    },
    {
        value: "internal",
        label: "Internal",
    },
] as const;

/* ========================================
   Deactivation Reason
======================================== */

export const deactivationReasonValues = [
    "payment_pending",
    "disciplinary_action",
    "attendance_issue",
    "batch_closed",
    "course_completed",
    "admin_hold",
    "policy_violation",
] as const;

export const deactivationReasonSchema =
    z.enum(
        deactivationReasonValues,
    );

export const deactivationReasonOptions =
    [
        {
            value:
                "payment_pending",
            label:
                "Payment pending",
        },
        {
            value:
                "disciplinary_action",
            label:
                "Disciplinary action",
        },
        {
            value:
                "attendance_issue",
            label:
                "Attendance issue",
        },
        {
            value:
                "batch_closed",
            label:
                "Batch closed",
        },
        {
            value:
                "course_completed",
            label:
                "Course completed",
        },
        {
            value:
                "admin_hold",
            label:
                "Admin hold",
        },
        {
            value:
                "policy_violation",
            label:
                "Policy violation",
        },
    ] as const;

/* ========================================
   Schema
======================================== */

export const createEnrollmentSchema =
    z
        .object({
            user_id: z.uuid(),

            target_type: z.enum([
                "batch",
                "course",
            ]),

            batch_id:
                z.uuid().optional(),

            course_id:
                z.uuid().optional(),

            registration_channel:
                z.enum([
                    "online",
                    "offline",
                ]),

            enrollment_type:
                enrollmentTypeSchema,

            is_active:
                z.boolean(),

            access_starts_at:
                z.string(),

            access_ends_at:
                z.string().optional(),

            notes:
                z
                    .string()
                    .trim()
                    .optional(),

            deactivation_reason:
                deactivationReasonSchema.optional(),
        })

        .superRefine(
            (data, ctx) => {
                /* target validation */
                const validTarget =
                    (data.target_type ===
                        "batch" &&
                        data.batch_id &&
                        !data.course_id) ||
                    (data.target_type ===
                        "course" &&
                        data.course_id &&
                        !data.batch_id);

                if (
                    !validTarget
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "target_type",
                        ],
                        message:
                            "Invalid target configuration",
                    });
                }

                /* date validation */
                if (
                    data.access_ends_at &&
                    new Date(
                        data.access_ends_at,
                    ) <
                    new Date(
                        data.access_starts_at,
                    )
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "access_ends_at",
                        ],
                        message:
                            "Access end must be after start",
                    });
                }

                /* active / inactive rules */
                if (
                    data.is_active &&
                    data.deactivation_reason
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "deactivation_reason",
                        ],
                        message:
                            "Active enrollment cannot have deactivation reason",
                    });
                }

                if (
                    !data.is_active &&
                    !data.deactivation_reason
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "deactivation_reason",
                        ],
                        message:
                            "Select deactivation reason",
                    });
                }
            },
        );

export type CreateEnrollmentInput =
    z.infer<
        typeof createEnrollmentSchema
    >;
