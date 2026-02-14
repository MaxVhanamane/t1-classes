import { DistributionStatus } from "../types/distribution.types"


export function computeDistributionStatus(
    startsAt: string,
    endsAt: string,
): DistributionStatus {


    const now = Date.now()
    const start = new Date(startsAt).getTime()
    const end = new Date(endsAt).getTime()

    if (now < start) return "scheduled"
    if (now >= start && now <= end) return "ongoing"
    return "completed"
}
