import "server-only";

import { getAuthIfHasRole } from "./get-auth-if-has-role";
import { resolveUnauthorizedRedirect } from "./resolve-unauthorized-redirect";
import { redirect } from "next/navigation";
import { ROLE_GROUPS } from "./role-groups";
import { AuthContext, UserRole } from "../types/auth.types";

/**
 * Ensures the user is authenticated and has one of the allowed roles.
 * Redirects otherwise.
 *
 * Intended ONLY for:
 * - Server Actions
 * - Server Components
 *
 * DO NOT USE in:
 * - Route Handlers (`route.ts`)
 * - Proxy (`proxy.ts`)
 * - Any API logic invoked via `fetch`
 *
 * This function calls `redirect()` internally through
 * `resolveUnauthorizedRedirect()`, which is only supported
 * during the Next.js rendering lifecycle.
 *
 * @throws {RedirectError} Internally thrown by Next.js `redirect()`.
 */
export async function requireRoleServerOnly(
    roles: readonly UserRole[]
): Promise<AuthContext> {
    const authState = await getAuthIfHasRole(roles);

    // User is not logged in or has no active session → go directly to login
    if (authState.status === "UNAUTHENTICATED") {
        redirect("/login");
    }

    // User is authenticated but does not have required role → role-based redirect
    if (authState.status !== "AUTHORIZED") {
        return resolveUnauthorizedRedirect(authState);
    }

    return authState.user;
}


/**
 * STAFF = admin + teacher
 */
export const requireStaffServerOnly = () =>
    requireRoleServerOnly(ROLE_GROUPS.STAFF);

/**
 * ADMIN only
 */
export const requireAdminServerOnly = () =>
    requireRoleServerOnly(ROLE_GROUPS.ADMIN);

/**
 * STUDENT only
 */
export const requireStudentServerOnly = () =>
    requireRoleServerOnly(ROLE_GROUPS.STUDENT);

/**
 * Any authenticated user
 */
export const requireAnyUserServerOnly = () =>
    requireRoleServerOnly(ROLE_GROUPS.ALL);
