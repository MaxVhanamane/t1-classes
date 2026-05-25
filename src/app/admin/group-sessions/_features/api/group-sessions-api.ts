import {
    PaginatedGroupSessionsResponse,
} from "../types/group-session.types";

export async function getGroupSessions({
    page,
    limit,
    search,
}: {
    page: number;
    limit: number;
    search: string;
}): Promise<PaginatedGroupSessionsResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
    });

    const response = await fetch(
        `/api/admin/group-sessions?${params}`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch group sessions",
        );
    }

    return response.json();
}

export async function getGroupSessionStudents(
    sessionId: string,
): Promise<string[]> {
    const response =
        await fetch(
            `/api/admin/group-sessions/${sessionId}/students`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch group session students",
        );
    }

    return response.json();
}
