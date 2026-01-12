export type BatchHighlights = {
    sections: {
        title: string;
        items: string[];
    }[];
};


export type BatchMode = "offline" | "online" | "hybrid";
export type BatchStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type BatchListItem = {
    id: string;
    name: string;
    description: string | null;

    batch_highlights: BatchHighlights | null;

    mode: BatchMode;
    status: BatchStatus;
    price: number;
    is_active: boolean;
    admission_open: boolean;
    center_name: string | null;
    languages: string[];
    start_date: string | null;
    end_date: string | null;
    duration: number | null;
    capacity: number | null;
    schedule: string | null;
    courses: {
        course: {
            id: string;
            title: string;
        };
    }[];
};

export type BatchEditState = "unlocked" | "locked";


export type BatchDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    batch?: BatchListItem; // undefined = create
    courses: CourseSelectItem[];
};


export interface CourseSelectItem {
    id: string
    title: string
    is_active: boolean
}
