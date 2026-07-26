export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type SyllabusBatchMetadata = {
    start_date: string | null;
    end_date: string | null;
};

export type SyllabusChapterRow = {
    id: string;
    batch_id: string;
    section_id: string;
    title: string;
    sort_order: number;
    source_chapter_id: string | null;
    status: ProgressStatus;
    started_at: string | null;
    completed_at: string | null;
    verified_at: string | null;
    updated_at: string;
    updated_by: {
        id: string;
        full_name: string;
    } | null;
    verified_by: {
        id: string;
        full_name: string;
    } | null;
};

export type SyllabusSectionRow = {
    id: string;
    batch_id: string;
    title: string;
    sort_order: number;
    chapters: SyllabusChapterRow[]; // Nested for the UI
};

export type SyllabusProgressResponse = {
    items: SyllabusSectionRow[];
    batch: SyllabusBatchMetadata;
    currentUserId: string;
    isAdmin: boolean;
};
