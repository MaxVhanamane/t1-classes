export const attendanceQueryKeys = {
    all: ["attendance"] as const,

    batches: () =>
        [...attendanceQueryKeys.all, "batches"] as const,

    session: (
        sessionId: string,
    ) =>
        [
            ...attendanceQueryKeys.all,
            "session",
            sessionId,
        ] as const,

    history: (
        params: Record<
            string,
            unknown
        >,
    ) =>
        [
            ...attendanceQueryKeys.all,
            "history",
            params,
        ] as const,

    batchReport: (
        params: Record<
            string,
            unknown
        >,
    ) =>
        [
            ...attendanceQueryKeys.all,
            "batch-report",
            params,
        ] as const,

    studentReport: (
        params: Record<
            string,
            unknown
        >,
    ) =>
        [
            ...attendanceQueryKeys.all,
            "student-report",
            params,
        ] as const,
    students: (
        batchId?: string,
    ) => [
            ...attendanceQueryKeys.all,
            "students",
            batchId,
        ],
};
