import { z } from "zod";

export const attendanceStatusEnum = z.enum([
    "present",
    "absent",
]);

export const attendanceRecordSchema =
    z.object({
        enrollment_id: z.uuid(
            "Invalid enrollment",
        ),

        status:
            attendanceStatusEnum,
    });

export const createAttendanceSessionSchema =
    z.object({
        batch_id: z.uuid(
            "Batch is required",
        ),
    });

export const updateAttendanceSessionSchema =
    z.object({
        session_id: z.uuid(
            "Invalid attendance session",
        ),

        records: z
            .array(
                attendanceRecordSchema,
            )
            .min(
                1,
                "At least one student is required",
            ),
    });

export const attendanceReportSchema =
    z
        .object({
            batch_id: z
                .uuid()
                .optional(),

            student_id: z
                .uuid()
                .optional(),

            start_date: z
                .string()
                .optional(),

            end_date: z
                .string()
                .optional(),
        })
        .refine(
            (data) => {
                if (
                    data.start_date &&
                    data.end_date
                ) {
                    return (
                        new Date(
                            data.start_date,
                        ) <=
                        new Date(
                            data.end_date,
                        )
                    );
                }

                return true;
            },
            {
                message:
                    "Start date must be before end date",

                path: ["end_date"],
            },
        );

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

export type AttendanceStatus =
    z.infer<
        typeof attendanceStatusEnum
    >;

export type AttendanceRecordValues =
    z.infer<
        typeof attendanceRecordSchema
    >;

export type CreateAttendanceSessionValues =
    z.infer<
        typeof createAttendanceSessionSchema
    >;

export type UpdateAttendanceSessionValues =
    z.infer<
        typeof updateAttendanceSessionSchema
    >;

export type AttendanceReportValues =
    z.infer<
        typeof attendanceReportSchema
    >;
