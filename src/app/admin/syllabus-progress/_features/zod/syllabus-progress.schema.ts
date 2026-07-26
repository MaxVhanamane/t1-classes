import { z } from "zod";

export const updateChapterStatusSchema = z.object({
    chapter_id: z.uuid(),
    status: z.enum(["not_started", "in_progress", "completed"]),
});

export const createSectionSchema = z.object({
    batch_id: z.uuid(),
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
});

// Importing now places chapters INSIDE an existing section
export const importCourseSchema = z.object({
    batch_id: z.uuid(),
    section_id: z.uuid(),
    course_id: z.uuid(),
});

// Adding a manual chapter to a section
export const createChapterSchema = z.object({
    batch_id: z.uuid(),
    section_id: z.uuid(),
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
});

export const editChapterTitleSchema = z.object({
    chapter_id: z.uuid(),
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
});

export const editSectionTitleSchema = z.object({
    section_id: z.uuid(),
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
});

export const verifyChapterSchema = z.object({
    chapter_id: z.uuid(),
});

export const deleteChapterSchema = z.object({
    chapter_id: z.uuid(),
});

export const deleteSectionSchema = z.object({
    section_id: z.string().uuid(),
});

export type DeleteSectionInput = z.infer<typeof deleteSectionSchema>;
export type DeleteChapterInput = z.infer<typeof deleteChapterSchema>;
export type VerifyChapterInput = z.infer<typeof verifyChapterSchema>;
export type EditChapterTitleInput = z.infer<typeof editChapterTitleSchema>;
export type EditSectionTitleInput = z.infer<typeof editSectionTitleSchema>;
export type UpdateChapterStatusInput = z.infer<typeof updateChapterStatusSchema>;
export type ImportCourseInput = z.infer<typeof importCourseSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
