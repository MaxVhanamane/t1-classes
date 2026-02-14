export type CourseDetails = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnailImage: string | null;
    courseType: "academic" | "foundation" | "exam" | "crash";
    classLevel: number | null;
    board: string | null;
    targetExam: string | null;
    subjects: string[] | null;
    price: number;
};
