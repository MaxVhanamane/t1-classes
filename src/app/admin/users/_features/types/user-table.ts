export type UserTableItem = {
    id: string;

    full_name: string;

    email: string;

    phone: string | null;

    role:
    | "student"
    | "teacher"
    | "admin";

    status:
    | "invited"
    | "active"
    | "inactive"
    | "blocked";

    qualification: string | null;

    bio: string | null;

    guardian_name: string | null;

    guardian_phone: string | null;

    guardian_email: string | null;

    created_at: string;
};

export type UsersResponse = {
    data: UserTableItem[];

    totalCount: number;

    page: number;

    limit: number;

    totalPages: number;
};
