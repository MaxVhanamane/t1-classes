export const mentorshipQueryKeys = {
    all: ["mentorship-sessions"] as const,

    lists: () =>
        [
            ...mentorshipQueryKeys.all,
            "list",
        ] as const,

    list: (
        page: number,
        limit: number,
        search: string,
    ) =>
        [
            ...mentorshipQueryKeys.lists(),
            page,
            limit,
            search,
        ] as const,

    students: (
        sessionId: string,
    ) =>
        [
            ...mentorshipQueryKeys.all,
            "students",
            sessionId,
        ] as const,

};
