import { UserRole } from "./get-auth"

export const ROLE_GROUPS: Record<string, UserRole[]> = {
    ADMIN: ["admin"],
    STAFF: ["admin", "teacher"],
    STUDENT: ["student"],
    ALL: ["admin", "teacher", "student"],
}
