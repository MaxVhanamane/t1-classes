import { DistributionAudience } from "./test-distribution.types";

export interface ScheduleFormValues {
    testId: string;

    audience: DistributionAudience;

    batchId: string | null;
    courseId: string | null;

    startsAt: Date;
    endsAt: Date;

    durationMinutes: number;
}
