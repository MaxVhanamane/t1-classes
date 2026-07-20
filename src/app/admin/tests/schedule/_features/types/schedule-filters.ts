import { TestType } from "../../../_features/types/test.types";


export type ScheduleFilters = {
    search: string;

    createdBy: string | "me";

    testType: TestType | null;
    page: number;
};
