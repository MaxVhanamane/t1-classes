
export type UserRole = "admin" | "teacher" | "student"
export type UserStatus = "active" | "inactive" | "blocked";
export interface AuthContext {
    userId: string
    email: string
    role: UserRole
    status: UserStatus
}
