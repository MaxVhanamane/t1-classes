export type LiveClassStatus =
    | "upcoming"
    | "live"
    | "completed";

export interface LiveClassBatch {
    id: string;
    title: string;
}

export interface LiveClassRow {
    id: string;
    title: string;
    description: string | null;
    youtube_live_id: string;
    starts_at: string;
    ends_at: string;

    batch_ids: string[];
    batches: LiveClassBatch[];

    created_by_name: string | null;
    batches_count: number;
}

export interface LiveClassesResponse {
    rows: LiveClassRow[];
    total: number;
    page: number;
    limit: number;
}
