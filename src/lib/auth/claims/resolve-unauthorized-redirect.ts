import "server-only";
import { redirect } from "next/navigation";
import type { AuthState } from "./get-auth-if-has-role";
import { UserRole } from "../types/auth.types";

export function resolveUnauthorizedRedirect(
    authState: AuthState
): never {
    // User is not authenticated
    if (authState.status === "UNAUTHENTICATED") {
        redirect("/login");
    }

    const role: UserRole | undefined = authState.user?.role;

    // User is authenticated but lacks permission
    switch (role) {
        case "admin":
            redirect("/admin");

        case "teacher":
            redirect("/admin/syllabus-progress");

        case "student":
            redirect("/student/dashboard");

        default:
            redirect("/unauthorized");
    }
}
