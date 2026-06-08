export type AttemptStatus =
    | "none"
    | "in_progress"
    | "submitted"
    | "expired";

export type TestStatus =
    | "ongoing"
    | "scheduled"
    | "completed";

export type BatchTest = {
    distributionId: string;

    testId: string;

    title: string;

    startsAt: string;

    endsAt: string;

    durationMinutes: number;

    status: TestStatus;

    isAttemptExpired: boolean;

    isResultUnlocked: boolean;

    attempt: {
        status: AttemptStatus;

        attemptId?: string;

        startedAt?: string;

        timeLimitSeconds?: number;

        attemptsUsed: number;
    };
};

export type BatchTestsResponse = {
    items: BatchTest[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};
