import { z } from "zod";

export const homeworkMaterialSchema = z.object({
    chapter_id: z.string().uuid({ message: "Please select a valid chapter" }),

    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title is too long"),

    description: z.string().max(1000, "Description is too long").nullable().optional(),

    homework_type: z.enum(["dpp", "assignment"], {
        message: "Please select a valid homework type",
    }),

    difficulty: z.enum(["easy", "medium", "hard", "mixed"], {
        message: "Please select a difficulty level",
    }),

    file_path: z.string().min(1, "Please upload a PDF file"),
    file_size: z.number().nullable().optional(),

    solution_file_path: z.string().nullable().optional(),
    solution_file_size: z.number().nullable().optional(),
});

export type HomeworkMaterialFormValues = z.infer<typeof homeworkMaterialSchema>;
