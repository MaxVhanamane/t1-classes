export type DistributionStatus = "scheduled" | "ongoing" | "completed"

export type AttemptStatus =
    | "none"
    | "in_progress"
    | "submitted"
    | "expired"

export type StudentBatchTest = {
    distributionId: string
    testId: string
    title: string

    startsAt: string
    endsAt: string
    durationMinutes: number
    computedStatus: DistributionStatus

    attempt: {
        status: AttemptStatus
        attemptId?: string
        remainingSeconds?: number
        attemptsUsed: number

    }
}

export type StartTestResponse =
    | {
        kind: "started" | "resumed"
        attemptId: string
        distributionId: string
        testId: string
        startedAt: string
        expiresAt: string
        timeLimitSeconds: number
    }
    | {
        kind: "denied"
        reason:
        | "not_enrolled"
        | "batch_closed"
        | "not_started"
        | "ended"
    }




