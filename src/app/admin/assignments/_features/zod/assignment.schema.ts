import { z } from "zod";

export const assignHomeworkSchema = z
    .object({
        batch_id: z.uuid(),
        subject: z.string().min(1, "Please select a subject"),
        chapter_id: z.string().min(1, "Please select a chapter"),
        material_id: z.string().min(1, "Please select a material"),
        publish_date: z.string().min(1, "Publish date is required"),
        due_date: z.string().min(1, "Due date is required"),
        is_solution_visible: z.boolean(),
        auto_publish_solution_at: z.string().optional().nullable(),
    })
    .refine((data) => new Date(data.due_date) > new Date(data.publish_date), {
        message: "Due date must be after the publish date",
        path: ["due_date"],
    });

export type AssignHomeworkFormValues = z.infer<typeof assignHomeworkSchema>;
