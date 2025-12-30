import { z } from "zod";

export const MAX_PDF_SIZE_MB = 10;
const MAX_PDF_SIZE = MAX_PDF_SIZE_MB * 1024 * 1024;

/**
 * Shared PDF file validation
 * (used by both add + edit)
 */
const pdfFileSchema = z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.type === "application/pdf", {
        message: "Only PDF files are allowed",
    })
    .refine((file) => file.name.toLowerCase().endsWith(".pdf"), {
        message: "File must have .pdf extension",
    })
    .refine((file) => file.size <= MAX_PDF_SIZE, {
        message: `PDF must be smaller than ${MAX_PDF_SIZE_MB}MB`,
    });

/**
 * ADD PDF (file required)
 */
export const addPdfFormSchema = z.object({
    title: z.string().min(1, "Title is required"),

    description: z.string().optional(),

    file: pdfFileSchema,

    durationMinutes: z
        .string()
        .optional()
        .refine(
            (v) => !v || /^\d+$/.test(v),
            "Duration must be a whole number"
        ),

    isFreePreview: z.boolean(),
});

export type AddPdfFormInput = z.infer<typeof addPdfFormSchema>;

/**
 * EDIT PDF (file optional, but fully validated if present)
 */
export const editPdfFormSchema = z.object({
    title: z.string().min(1, "Title is required"),

    description: z.string().optional(),

    file: pdfFileSchema.optional(),

    durationMinutes: z
        .string()
        .optional()
        .refine(
            (v) => !v || /^\d+$/.test(v),
            "Duration must be a whole number"
        ),

    isFreePreview: z.boolean(),
});

export type EditPdfFormInput = z.infer<typeof editPdfFormSchema>;
