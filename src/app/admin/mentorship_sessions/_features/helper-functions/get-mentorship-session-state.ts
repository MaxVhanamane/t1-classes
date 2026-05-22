interface GetMentorshipSessionStateParams {
    starts_at: string;

    ends_at: string;

    meeting_id: string | null;
}

export type MentorshipSessionState =
    | "scheduled"
    | "ready"
    | "live"
    | "completed";

export function getMentorshipSessionState({
    starts_at,
    ends_at,
    meeting_id,
}: GetMentorshipSessionStateParams): MentorshipSessionState {
    const now = new Date();

    const startsAt = new Date(starts_at);

    const endsAt = new Date(ends_at);

    const startWindow = new Date(
        startsAt.getTime() - 5 * 60 * 1000,
    );

    if (now > endsAt) {
        return "completed";
    }

    if (
        meeting_id &&
        now >= startsAt &&
        now <= endsAt
    ) {
        return "live";
    }

    if (now >= startWindow) {
        return "ready";
    }

    return "scheduled";
}
