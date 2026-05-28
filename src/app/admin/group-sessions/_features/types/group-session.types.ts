export type GroupSessionAudienceType =
    | "batch"
    | "selected_students";

export interface GroupSession {
    id: string;

    title: string;

    description: string | null;

    batch_id: string;

    audience_type:
    | "batch"
    | "selected_students";

    starts_at: string;

    expected_duration_minutes: number | null;

    meeting_id: string | null;

    meeting_pwd: string | null;

    meeting_passcode: string | null;

    created_by: string;

    created_at: string;
}

export interface GroupSessionStudent {
    id: string;

    session_id: string;

    student_id: string;

    created_at: string;
}

export interface PaginatedGroupSessionsResponse {
    data: GroupSession[];

    page: number;

    totalPages: number;

    totalCount: number;
}

export interface GroupSessionBatchOption {
    id: string;

    title: string;
}

export interface GroupSessionStudentOption {
    id: string;

    full_name: string;
}
