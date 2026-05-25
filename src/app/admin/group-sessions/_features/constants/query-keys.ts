export const groupSessionsQueryKeys = {
    all: ["group-sessions"] as const,

    lists: () =>
        [
            ...groupSessionsQueryKeys.all,
            "list",
        ] as const,

    list: (
        page: number,
        limit: number,
        search: string,
    ) =>
        [
            ...groupSessionsQueryKeys.lists(),
            page,
            limit,
            search,
        ] as const,

    students: (
        sessionId: string,
    ) =>
        [
            ...groupSessionsQueryKeys.all,
            "students",
            sessionId,
        ] as const,
};
