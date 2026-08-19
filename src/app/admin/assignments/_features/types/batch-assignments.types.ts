export type BatchAssignmentFilters = {
    search: string;
    subject: string;
    status: "all" | "ongoing" | "scheduled" | "completed";
    page: number;
};

export type BatchAssignmentRow = {
    id: string;
    publish_date: string;
    due_date: string;
    is_solution_visible: boolean;
    auto_publish_solution_at: string | null;
    created_at: string;
    updated_at: string;
    creator: { full_name: string } | null;
    updater: { full_name: string } | null;
    material: {
        id: string;
        title: string;
        homework_type: string;
        file_path: string;
        solution_file_path: string | null;
        chapter: {
            id: string;
            subject: string;
            chapter_name: string;
        };
    };
};

export type BatchAssignmentListResponse = {
    items: BatchAssignmentRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};
