export type MentorshipAudienceType =
    | "batch"
    | "selected_students";

export type MentorshipDuration =
    | 15
    | 20
    | 30;

export interface MentorshipSession {
    id: string;

    title: string;

    description: string | null;

    batch_id: string;

    meeting_id: string | null;

    audience_type:
    | "batch"
    | "selected_students";

    starts_at: string;

    ends_at: string;

    duration_minutes:
    | 15
    | 20
    | 25
    | 30;
}

export interface MentorshipSessionStudent {
    id: string;

    session_id: string;

    student_id: string;

    created_at: string;
}

export interface PaginatedMentorshipSessionsResponse {
    data: MentorshipSession[];

    page: number;

    totalPages: number;

    totalCount: number;
}

export interface MentorshipBatchOption {
    id: string;

    title: string;
}

export interface MentorshipStudentOption {
    id: string;

    full_name: string;
}
