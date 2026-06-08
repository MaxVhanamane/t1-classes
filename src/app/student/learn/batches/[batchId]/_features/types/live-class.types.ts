export type LiveClassStatus =
    | "live"
    | "upcoming"
    | "completed";

export type BatchLiveClass = {
    id: string;

    title: string;

    description: string | null;

    youtubeLiveId: string;

    startsAt: string;

    endsAt: string;

    status: LiveClassStatus;
};

export type LiveClassesResponse = {
    items: BatchLiveClass[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};
