import { PaginatedMentorshipSessionsResponse } from "../types/mentorship.types";

export async function getMentorshipSessions({
    page,
    limit,
    search,
}: {
    page: number;
    limit: number;
    search: string;
}): Promise<PaginatedMentorshipSessionsResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
    });

    const response = await fetch(
        `/api/admin/mentorship-sessions?${params}`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch mentorship sessions",
        );
    }

    return response.json();
}

export async function getMentorshipQuota() {
    const response = await fetch(
        "/api/admin/mentorship-sessions/quota",
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch mentorship quota",
        );
    }

    return response.json();
}


export async function getMentorshipSessionStudents(
    sessionId: string,
): Promise<string[]> {
    const response =
        await fetch(
            `/api/admin/mentorship-sessions/${sessionId}/students`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch mentorship session students",
        );
    }

    return response.json();
}
