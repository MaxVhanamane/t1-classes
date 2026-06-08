export type QuestionPaperCategory =
    | "previous_year"
    | "practice";


export type QuestionPaper = {
    id: string;
    title: string;
    targetExam: string | null;
    subject: string | null;
    paperCategory: "previous_year" | "practice";
    years: number[];
    classLevel: number | null;
    description: string | null;
    filePath: string;
    fileSize: number | null;
};
