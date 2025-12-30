export type UserRole = "student" | "teacher" | "admin";

export type UserStatus = "active" | "inactive" | "blocked";

export type AppUser = {
    id: string;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    created_at: string;
};


export type UserSearchResult = {
    id: string;
    full_name: string;
    phone: string | null;
};
