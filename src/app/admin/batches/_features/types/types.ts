export type BatchListItem = {
    id: string;
    name: string;
    description: string | null;
    mode: "offline" | "online" | "hybrid";
    status: "upcoming" | "ongoing" | "completed" | "cancelled";

    is_active: boolean;
    admission_open: boolean;

    center_name: string | null;
    languages: string[];

    start_date: string | null;
    end_date: string | null;
    duration: number | null;

    capacity: number | null;
    schedule: string | null;

    course_info?: {
        id: string;
        title: string;
    } | null;
};



export type BatchDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    batch?: BatchListItem; // undefined = create
    courses: {
        id: string;
        title: string;
    }[];
};


export type CourseSelectItem = {
    id: string;
    title: string;
};
