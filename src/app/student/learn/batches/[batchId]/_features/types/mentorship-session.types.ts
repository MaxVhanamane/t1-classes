export type MentorshipSessionStatus =
    | "live"
    | "scheduled"
    | "ended";

export type StudentMentorshipSession = {
    id: string;

    title: string;

    description: string | null;

    startsAt: string;

    endsAt: string | null;

    durationMinutes: number;

    audienceType:
    | "batch"
    | "selected_students";

    teacherName: string;

    meetingId: string | null;

    status: MentorshipSessionStatus;

    canJoin: boolean;
};

export type StudentMentorshipSessionsResponse = {
    items: StudentMentorshipSession[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};
