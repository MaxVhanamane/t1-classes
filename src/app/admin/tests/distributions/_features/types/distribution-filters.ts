import { DistributionStatus } from "./distribution.types";

export type DistributionFilters = {
    search: string;

    createdBy: string | "me" | null;
    status: DistributionStatus
    page: number;

};
