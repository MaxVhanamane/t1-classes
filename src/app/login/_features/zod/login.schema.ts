import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }), // Just check if it's not empty
});

export type LoginInput = z.infer<typeof loginSchema>;