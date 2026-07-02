import { z } from "zod";

export const pushRegistrationSchema = z.object({
    fid: z.string().trim().min(1),
    userAgent: z.string().trim().max(1024),
});

export type PushRegistrationInput =
    z.infer<typeof pushRegistrationSchema>;
