import {
    UserRole,
    UserStatus,
} from "../zod/user-schema";

export type UserDialogData = {
    id: string;

    email: string;

    full_name: string;

    phone: string | null;

    role: UserRole;

    status: UserStatus;

    qualification: string | null;

    bio: string | null;

    guardian_name: string | null;

    guardian_phone: string | null;

    guardian_email: string | null;
};
