export type CourseStructureType = "chapter" | "topic";

export type CourseStructureRow = {
    id: string;
    course_id: string;
    parent_id: string | null;
    title: string;
    structure_type: CourseStructureType;
    sort_order: number;
    is_published: boolean;
    created_at: string;
};


export type ChapterRow = {
    id: string;
    title: string;
    sort_order: number;
    is_published: boolean
};

export type TopicRow = {
    id: string;
    title: string;
    sort_order: number;
    parent_id: string;
};


export type TopicWithCount = {
    id: string;
    title: string;
    sort_order: number;
    is_published: boolean,
    contentCount: number;
};
