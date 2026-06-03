"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { attendanceQueryKeys } from "../constants/query-keys";

import {
    AttendanceStatus,
    AttendanceStudentReportFilters,
    AttendanceStudentReportResponse,
} from "../types/attendance";

type UpdateAttendanceRecordInput = {
    attendanceRecordId: string;

    status: AttendanceStatus;
};

type UpdateAttendanceRecordResponse = {
    attendance_record_id: string;

    status: AttendanceStatus;

    updated_at: string | null;

    updated_by: string | null;

    updated_by_name: string | null;
};

async function updateAttendanceRecord(
    input: UpdateAttendanceRecordInput,
): Promise<UpdateAttendanceRecordResponse> {
    const response = await fetch(
        `/api/admin/attendance/attendance-records/${input.attendanceRecordId}`,
        {
            method: "PATCH",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                status: input.status,
            }),
        },
    );

    const data =
        await response
            .json()
            .catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ??
            "Failed to update attendance",
        );
    }

    return data;
}

export function useUpdateAttendanceRecord(
    filters: AttendanceStudentReportFilters,
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            updateAttendanceRecord,

        onMutate:
            async (
                variables,
            ) => {
                const queryKey =
                    attendanceQueryKeys.studentReport(
                        filters,
                    );

                await queryClient.cancelQueries(
                    {
                        queryKey,
                    },
                );

                const previousData =
                    queryClient.getQueryData<AttendanceStudentReportResponse>(
                        queryKey,
                    );

                if (!previousData) {
                    return {
                        previousData:
                            undefined,
                    };
                }

                const session =
                    previousData.sessions.find(
                        (item) =>
                            item.attendance_record_id ===
                            variables.attendanceRecordId,
                    );

                if (!session) {
                    return {
                        previousData,
                    };
                }

                if (
                    session.status ===
                    variables.status
                ) {
                    return {
                        previousData,
                    };
                }

                const nextSummary =
                {
                    ...previousData.summary,
                };

                if (
                    session.status ===
                    "absent" &&
                    variables.status ===
                    "present"
                ) {
                    nextSummary.present_count += 1;

                    nextSummary.absent_count -= 1;
                }

                if (
                    session.status ===
                    "present" &&
                    variables.status ===
                    "absent"
                ) {
                    nextSummary.present_count -= 1;

                    nextSummary.absent_count += 1;
                }

                nextSummary.attendance_percentage =
                    nextSummary.classes_during_enrollment >
                        0
                        ? Number(
                            (
                                (nextSummary.present_count /
                                    nextSummary.classes_during_enrollment) *
                                100
                            ).toFixed(2),
                        )
                        : 0;

                queryClient.setQueryData<AttendanceStudentReportResponse>(
                    queryKey,
                    {
                        ...previousData,

                        summary:
                            nextSummary,

                        sessions:
                            previousData.sessions.map(
                                (
                                    item,
                                ) =>
                                    item.attendance_record_id ===
                                        variables.attendanceRecordId
                                        ? {
                                            ...item,

                                            status:
                                                variables.status,
                                        }
                                        : item,
                            ),
                    },
                );

                return {
                    previousData,
                };
            },

        onError: (
            _error,
            _variables,
            context,
        ) => {
            if (
                context?.previousData
            ) {
                queryClient.setQueryData(
                    attendanceQueryKeys.studentReport(
                        filters,
                    ),
                    context.previousData,
                );
            }
        },

        onSuccess: (
            result,
        ) => {
            queryClient.setQueryData<AttendanceStudentReportResponse>(
                attendanceQueryKeys.studentReport(
                    filters,
                ),
                (
                    current,
                ) => {
                    if (!current) {
                        return current;
                    }

                    return {
                        ...current,

                        sessions:
                            current.sessions.map(
                                (
                                    session,
                                ) =>
                                    session.attendance_record_id ===
                                        result.attendance_record_id
                                        ? {
                                            ...session,

                                            status:
                                                result.status,

                                            updated_at:
                                                result.updated_at,

                                            updated_by_name:
                                                result.updated_by_name,
                                        }
                                        : session,
                            ),
                    };
                },
            );
        },
    });
}
