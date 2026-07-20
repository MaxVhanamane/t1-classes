import type { MentorshipSessionFilters } from "../types/mentorship-filters";

export async function getMentorshipSessions({
    page,
    search,
    batchId,
    status,
    audienceType,
    createdBy,
}: {
    page: number;
    search: string;
    batchId: string;
    status: MentorshipSessionFilters["status"];
    audienceType: MentorshipSessionFilters["audienceType"];
    createdBy: string;
}) {
    const params = new URLSearchParams({
        page: String(page),
        search,
        batchId,
        status,
        audienceType,
        createdBy,
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

export async function getMentorshipSessionStudents(
    sessionId: string,
): Promise<string[]> {
    const response = await fetch(
        `/api/admin/mentorship-sessions/${sessionId}/students`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch mentorship session students",
        );
    }

    return response.json();
}
