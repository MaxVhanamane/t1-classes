import { z } from "zod";

/**
 * Enums
 */
export const userRoles = ["student", "teacher", "admin"] as const;
export const userStatuses = ["active", "inactive", "blocked"] as const;

export const userRoleEnum = z.enum(userRoles);
export const userStatusEnum = z.enum(userStatuses);

/**
 * Reusable Validators
 */
const nameSchema = z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .trim();

const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim();

const phoneSchema = z
    .string()
    .regex(/^\+?[0-9\s-]*$/, "Invalid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .optional()
    .or(z.literal(""));

/**
 * Base Schema
 * Contains fields shared across user operations.
 */
export const baseUserSchema = z.object({
    email: emailSchema,
    full_name: nameSchema,
    phone: phoneSchema,
    role: userRoleEnum,
});

/**
 * Create User Schema
 */
export const createUserSchema = baseUserSchema;

/**
 * Update User Schema
 * Excludes email since it is not editable.
 */
export const updateUserSchema = baseUserSchema
    .omit({ email: true })
    .extend({
        status: userStatusEnum,
    });

/**
 * Optional: Partial Update Schema
 * Useful for PATCH-style updates.
 */
export const partialUpdateUserSchema = updateUserSchema.partial();

/**
 * Types
 */
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type PartialUpdateUserFormValues = z.infer<
    typeof partialUpdateUserSchema
>;

export type UserRole = z.infer<typeof userRoleEnum>;
export type UserStatus = z.infer<typeof userStatusEnum>;
