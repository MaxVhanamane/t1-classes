import { DistributionStatus } from "../types/test-distribution.types";


export function computeStatus(
    startsAt: string,
    endsAt: string,

): DistributionStatus {
    const now = new Date().getTime();
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();


    if (now < start) return "scheduled";
    if (now >= start && now <= end) return "ongoing";

    return "completed";
}
