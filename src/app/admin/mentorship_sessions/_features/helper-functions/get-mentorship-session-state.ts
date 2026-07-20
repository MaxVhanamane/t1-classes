interface GetMentorshipSessionStateParams {
    starts_at: string;

    ends_at: string;

    meeting_id: string | null;
}

export const MENTORSHIP_READY_WINDOW_MINUTES = 5;

export const MENTORSHIP_READY_WINDOW_MS =
    MENTORSHIP_READY_WINDOW_MINUTES * 60 * 1000;

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
        startsAt.getTime() - MENTORSHIP_READY_WINDOW_MS,
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
