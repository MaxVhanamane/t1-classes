import { LIVE_CLASS_STATUSES } from "../../constants/live-classes";

export type LiveClassStatus =
    (typeof LIVE_CLASS_STATUSES)[number];

export interface LiveClass {
    id: string;
    title: string;
    description: string | null;
    youtube_live_id: string;
    starts_at: string;
    ends_at: string;
    created_at: string;
    created_by: string;
    creator_name: string;
    batch_ids: string[];
    batch_titles: string[];
    status: Exclude<LiveClassStatus, "all">;
}

export interface LiveClassesResponse {
    data: LiveClass[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
}
