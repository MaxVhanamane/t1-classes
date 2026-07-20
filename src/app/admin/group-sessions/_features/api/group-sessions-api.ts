import { GroupSessionFilters } from "../types/group-session-filters";
import { PaginatedGroupSessionsResponse } from "../types/group-session.types";

export async function getGroupSessions(
    filters: GroupSessionFilters,
): Promise<PaginatedGroupSessionsResponse> {
    const params = new URLSearchParams({
        page: String(filters.page),
        search: filters.search,
        batchId: filters.batchId,
        status: filters.status,
        audienceType: filters.audienceType,
        createdBy: filters.createdBy,
    });

    const response = await fetch(
        `/api/admin/group-sessions?${params.toString()}`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch group sessions");
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
