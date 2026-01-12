export type CourseUnitContent = {
    id: string;
    title: string;
    unitType: "video" | "pdf";
    description: string | null;
    durationMinutes: number | null;

    // gated fields
    contentUrl?: string | null;
    videoProvider?: "youtube" | "vimeo" | null;
    filePath?: string | null;
};
