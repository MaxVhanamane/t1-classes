import { z } from "zod";

export const leadStatusOptions = [
    { value: "new", label: "New" },
    { value: "attempting_contact", label: "Attempting Contact" },
    { value: "in_progress", label: "In Progress" },
    { value: "enrolled", label: "Enrolled" },
    { value: "not_interested", label: "Not Interested" },
    { value: "invalid", label: "Invalid/Spam" },
] as const;

const leadStatusEnum = z.enum([
    "new",
    "attempting_contact",
    "in_progress",
    "enrolled",
    "not_interested",
    "invalid",
]);

export const updateLeadSchema = z.object({
    status: leadStatusEnum,
    next_follow_up_at: z.string().optional().nullable(),
    lost_reason: z.string().optional().nullable(),
}).refine(
    (data) => {
        // Require a lost reason if they are marked as not interested
        if (data.status === "not_interested" && !data.lost_reason?.trim()) {
            return false;
        }
        return true;
    },
    {
        message: "Reason is required when marking a lead as Not Interested",
        path: ["lost_reason"],
    }
);

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
