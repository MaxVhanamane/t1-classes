export type AttachmentTarget = {
    id: string;

    title: string;

    class_level: number | null;

    target_exam: string | null;
};

export type AttachmentTargetsResponse = {
    items: AttachmentTarget[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

