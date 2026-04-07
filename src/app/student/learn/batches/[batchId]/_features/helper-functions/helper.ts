export function getDistributionStatus(
    startsAt: string,
    endsAt: string
) {
    const now = Date.now();
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();

    if (now < start) return "scheduled";
    if (now <= end) return "ongoing";
    return "completed";
}

export function getAttemptExpiryMs(
    startedAt: string,
    timeLimitSeconds: number,
    endsAt: string
) {
    const attemptExpiry =
        new Date(startedAt).getTime() +
        timeLimitSeconds * 1000;

    const distributionEnd =
        new Date(endsAt).getTime();

    return Math.min(
        attemptExpiry,
        distributionEnd
    );
}
