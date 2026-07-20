export type GroupSessionAudienceType =
    | "batch"
    | "selected_students";

export type GroupSessionStatus =
    | "waiting"
    | "scheduled"
    | "live"
    | "ended";

export interface GroupSession {
    id: string;

    title: string;

    description: string | null;

    batch_id: string;

    batch_title: string;

    audience_type: GroupSessionAudienceType;

    starts_at: string;

    expected_duration_minutes: number | null;

    meeting_id: string | null;

    meeting_pwd: string | null;

    meeting_passcode: string | null;

    created_by: string;

    creator_name: string;

    created_at: string;

    status: GroupSessionStatus;

    total_count: number;

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
    pageSize: number;
}

export interface GroupSessionBatchOption {
    id: string;

    title: string;
}

export interface GroupSessionStudentOption {
    id: string;

    full_name: string;
}
