export type EnrollmentFilters = {
    search: string;

    active:
    | "all"
    | "active"
    | "inactive";

    targetType:
    | "all"
    | "course"
    | "batch";

    enrollmentType:
    | "all"
    | "standard"
    | "scholarship"
    | "trial"
    | "internal";

    registrationChannel:
    | "all"
    | "offline"
    | "online";

    feeStatus:
    | "all"
    | "no_fee_plan"
    | "pending"
    | "paid"
    | "overpaid";

    feePlanRevision:
    | "all"
    | "revised"
    | "never";

    access:
    | "all"
    | "ongoing"
    | "upcoming"
    | "ended";

    batchId: string | null;

    courseId: string | null;

    page: number;
};
