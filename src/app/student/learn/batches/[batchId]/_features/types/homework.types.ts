export type HomeworkStatus = "overview" | "ongoing" | "scheduled" | "completed";

export type StudentHomeworkRow = {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    chapter_name: string;
    publish_date: string;
    due_date: string;
    is_solution_visible: boolean;
    auto_publish_solution_at: string | null;
    file_path: string;
    solution_file_path: string | null;
    is_completed: boolean;
};

export type StudentHomeworkResponse = {
    items: StudentHomeworkRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type HomeworkCalendarItem = {
    id: string;
    title: string;
    subject: string;
    publish_date: string;
    due_date: string;
    is_completed: boolean;
};

export type HomeworkCalendarResponse = HomeworkCalendarItem[];
