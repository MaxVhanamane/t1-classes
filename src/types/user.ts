export type UserRole = "student" | "teacher" | "admin";

export type UserStatus = "active" | "inactive" | "blocked";

export type AppUser = {
    id: string
    full_name: string
    phone: string | null
    role: UserRole
    status: UserStatus
    profile_image: string | null
    created_at: string
    email: string
}


export type UserSearchResult = {
    id: string;
    full_name: string;
    phone: string | null;
};
