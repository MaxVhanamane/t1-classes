export type BaseUnit = {
    id: string;
    title: string;
    description: string | null;
    sort_order: number;
    is_free_preview: boolean;
    duration_minutes: number | null;
    is_published: boolean
};

export type VideoUnit = BaseUnit & {
    unit_type: "video";
    content_url: string; // YouTube / Vimeo
    video_provider: "youtube" | "vimeo";
    file_path: null;
};

export type PdfUnit = BaseUnit & {
    unit_type: "pdf";
    file_path: string; // Supabase Storage path
    content_url: null;
};

export type CourseUnit = VideoUnit | PdfUnit;
