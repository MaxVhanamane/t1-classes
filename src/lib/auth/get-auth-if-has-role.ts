import "server-only";
import { getAuth, UserRole } from "./get-auth";

/**
 * Represents the authenticated user context.
 */
export interface AuthContext {
    userId: string;
    email?: string;
    role?: UserRole;
}

/**
 * Discriminated union representing the authentication state.
 */
export type AuthState =
    | { status: "UNAUTHENTICATED" }
    | { status: "UNAUTHORIZED"; user: AuthContext }
    | { status: "AUTHORIZED"; user: AuthContext };


/**
 * Checks whether the current user has one of the allowed roles.
 * This function does NOT perform redirects or throw errors.
 * It is safe to use in Server Actions, Route Handlers, and proxy logic.
 */
export async function getAuthIfHasRole(
    allowedRoles: readonly UserRole[]
): Promise<AuthState> {
    const user = await getAuth();

    // User is not logged in
    if (!user) {
        return { status: "UNAUTHENTICATED" };
    }

    // User is logged in but does not have the required role
    if (!user.role || !allowedRoles.includes(user.role)) {
        return { status: "UNAUTHORIZED", user };
    }

    // User is authenticated and authorized
    return { status: "AUTHORIZED", user };
}
