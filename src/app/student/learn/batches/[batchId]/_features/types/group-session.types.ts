export type GroupSessionStatus =
    | "scheduled"
    | "live"
    | "ended"
    | "waiting_for_link";

export type StudentGroupSession = {
    id: string;

    title: string;

    description: string | null;

    startsAt: string;

    expectedDurationMinutes: number | null;

    audienceType: "batch" | "selected_students";

    teacherName: string;

    meetingId: string | null;

    meetingPasscode: string | null;

    status: GroupSessionStatus;

    canJoin: boolean;
};

export type GroupSessionsResponse = {
    items: StudentGroupSession[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};
