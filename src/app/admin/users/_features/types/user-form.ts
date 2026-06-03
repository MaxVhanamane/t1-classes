import {
    UserRole,
    UserStatus,
} from "../zod/user-schema";

export type UserFormValues = {
    email: string;

    full_name: string;

    phone: string;

    role: UserRole;

    status: UserStatus;

    qualification: string;

    bio: string;

    guardian_name: string;

    guardian_phone: string;

    guardian_email: string;
};
