
export const ROLE_GROUPS = {
    ADMIN: ["admin"],
    STAFF: ["admin", "teacher"],
    STUDENT: ["student"],
    ALL: ["admin", "teacher", "student"],
} as const;
