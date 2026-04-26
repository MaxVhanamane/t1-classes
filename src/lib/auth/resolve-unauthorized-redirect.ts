import "server-only";
import { redirect } from "next/navigation";
import type { AuthState } from "./get-auth-if-has-role";
import type { UserRole } from "./get-auth";

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
        case "teacher":
            redirect("/admin");

        case "student":
            redirect("/student/dashboard");

        default:
            redirect("/unauthorized");
    }
}
