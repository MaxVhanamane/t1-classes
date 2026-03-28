import { JSONContent } from "@tiptap/react";
export type CourseDetails = {
    id: string;
    title: string;
    subtitle: string | null;
    learning_outcomes: string[] | null;
    target_audience: string[] | null;
    slug: string;
    description: JSONContent | null;
    thumbnailImage: string | null;
    courseType: "academic" | "foundation" | "exam" | "crash";
    classLevel: number | null;
    board: string | null;
    targetExam: string | null;
    subjects: string[] | null;
    sale_price: number;
    list_price: number;
    languages: string[] | null;
};
