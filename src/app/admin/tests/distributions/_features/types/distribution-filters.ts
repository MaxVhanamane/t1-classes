import { DistributionStatus } from "./distribution.types";

export type DistributionFilters = {
    search: string;

    createdBy: string | "me";
    status: DistributionStatus
    page: number;

};
