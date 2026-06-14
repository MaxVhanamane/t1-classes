import type { EnrollmentFilters } from "../types/enrollment-filters";

export const ENROLLMENT_ACTIVE_FILTERS = [
    "all",
    "active",
    "inactive",
] as const satisfies readonly EnrollmentFilters["active"][];

export const ENROLLMENT_TARGET_TYPE_FILTERS = [
    "all",
    "batch",
    "course",
] as const satisfies readonly EnrollmentFilters["targetType"][];

export const ENROLLMENT_TYPE_FILTERS = [
    "all",
    "standard",
    "scholarship",
    "trial",
    "internal",
] as const satisfies readonly EnrollmentFilters["enrollmentType"][];

export const ENROLLMENT_REGISTRATION_CHANNEL_FILTERS = [
    "all",
    "online",
    "offline",
] as const satisfies readonly EnrollmentFilters["registrationChannel"][];

export const ENROLLMENT_FEE_STATUS_FILTERS = [
    "all",
    "no_fee_plan",
    "pending",
    "paid",
    "overpaid",
] as const satisfies readonly EnrollmentFilters["feeStatus"][];

export const ENROLLMENT_FEE_PLAN_REVISION_FILTERS = [
    "all",
    "revised",
    "never",
] as const satisfies readonly EnrollmentFilters["feePlanRevision"][];

export const ENROLLMENT_ACCESS_FILTERS = [
    "all",
    "ongoing",
    "upcoming",
    "ended",
] as const satisfies readonly EnrollmentFilters["access"][];

export const DEFAULT_ENROLLMENT_FILTERS: EnrollmentFilters = {
    search: "",

    active: "all",

    targetType: "all",

    enrollmentType: "all",

    registrationChannel: "all",

    feeStatus: "all",

    feePlanRevision: "all",

    access: "all",

    batchId: null,

    courseId: null,

    page: 1,
};
