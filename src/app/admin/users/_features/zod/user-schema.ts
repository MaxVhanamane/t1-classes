import { z } from "zod";

/**
 * Enums
 */

export const userRoles = [
    "student",
    "teacher",
    "admin",
] as const;

export const userStatuses = [
    "active",
    "inactive",
    "blocked",
] as const;

export const userRoleEnum =
    z.enum(userRoles);

export const userStatusEnum =
    z.enum(userStatuses);

/**
 * Reusable Validators
 */

const nameSchema = z
    .string()
    .trim()
    .min(
        2,
        "Full name must be at least 2 characters",
    )
    .max(
        100,
        "Full name is too long",
    );

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(
        1,
        "Email is required",
    )
    .email(
        "Invalid email address",
    );

/* ---------------------------------------- */
/* Phone (REQUIRED)                         */
/* ---------------------------------------- */

const phoneSchema = z
    .string()
    .trim()
    .min(
        1,
        "Phone number is required",
    )
    .regex(
        /^\+?[0-9\s-]{10,15}$/,
        "Invalid phone number",
    );

/* ---------------------------------------- */
/* Optional Guardian Phone                  */
/* ---------------------------------------- */

const optionalGuardianPhoneSchema =
    z
        .string()
        .trim()
        .refine(
            (value) =>
                value === "" ||
                /^\+?[0-9\s-]{10,15}$/.test(
                    value,
                ),
            {
                message:
                    "Invalid guardian phone number",
            },
        );

/* ---------------------------------------- */
/* Optional Email                           */
/* ---------------------------------------- */

const optionalEmailSchema = z
    .string()
    .trim()
    .email(
        "Invalid email address",
    )
    .or(z.literal(""));

/**
 * Shared User Schema
 */

export const userSchema =
    z
        .object({
            email:
                emailSchema,

            full_name:
                nameSchema,

            /* REQUIRED */
            phone:
                phoneSchema,

            role:
                userRoleEnum,

            status:
                userStatusEnum,

            qualification: z
                .string()
                .trim(),

            bio: z
                .string()
                .trim()
                .max(
                    1000,
                    "Bio is too long",
                ),

            guardian_name: z
                .string()
                .trim(),

            /* OPTIONAL */
            guardian_phone:
                optionalGuardianPhoneSchema,

            guardian_email:
                optionalEmailSchema,
        })
        .superRefine(
            (data, ctx) => {
                /* ---------------------------------- */
                /* Student Guardian Validation        */
                /* ---------------------------------- */

                if (
                    data.role ===
                    "student"
                ) {
                    if (
                        !data.guardian_phone ||
                        data.guardian_phone
                            .trim()
                            .length < 10
                    ) {
                        ctx.addIssue({
                            code:
                                z.ZodIssueCode
                                    .custom,

                            path: [
                                "guardian_phone",
                            ],

                            message:
                                "Guardian phone is required for students",
                        });
                    }
                }
            },
        );

/**
 * Aliases
 */

export const createUserSchema =
    userSchema;

export const updateUserSchema =
    userSchema;

/**
 * Types
 */

export type UserFormValues =
    z.infer<
        typeof userSchema
    >;

export type CreateUserFormValues =
    UserFormValues;

export type UpdateUserFormValues =
    UserFormValues;

export type UserRole =
    z.infer<
        typeof userRoleEnum
    >;

export type UserStatus =
    z.infer<
        typeof userStatusEnum
    >;
