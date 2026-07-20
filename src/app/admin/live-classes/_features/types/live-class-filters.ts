import { LiveClassStatus } from "./live-class.types";

export interface LiveClassFilters {
    search: string;
    batchId: string;
    status: LiveClassStatus;
    createdBy: string;
    page: number;
}
