import "server-only"
import { NextResponse } from "next/server";

import { getAuthIfHasRole } from "./get-auth-if-has-role";
import { ROLE_GROUPS } from "./role-groups";
import { AuthContext, UserRole } from "../types/auth.types";


/**
 * Ensures the user is authenticated and has one of the allowed roles.
 * Returns HTTP responses instead of redirecting.
 *
 *  Intended ONLY for:
 * - Route Handlers (`route.ts`)
 *
 *  DO NOT USE in:
 * - Server Actions
 * - Server Components
 *
 * This function does NOT call `redirect()`.
 * Instead, it returns appropriate HTTP responses (401 / 403).
 */
export async function requireRoleApiRoute(
    roles: readonly UserRole[]
): Promise<
    | { authorized: true; user: AuthContext }
    | { authorized: false; response: NextResponse }
> {
    const authState = await getAuthIfHasRole(roles);

    // User is not logged in → 401
    if (authState.status === "UNAUTHENTICATED") {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "UNAUTHENTICATED" },
                { status: 401 }
            ),
        };
    }

    // User is logged in but lacks required role → 403
    if (authState.status !== "AUTHORIZED") {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "FORBIDDEN" },
                { status: 403 }
            ),
        };
    }

    return {
        authorized: true,
        user: authState.user,
    };
}


/**
 * STAFF = admin + teacher
 */
export const requireStaffApiRoute = () =>
    requireRoleApiRoute(ROLE_GROUPS.STAFF);

/**
 * ADMIN only
 */
export const requireAdminApiRoute = () =>
    requireRoleApiRoute(ROLE_GROUPS.ADMIN);

/**
 * STUDENT only
 */
export const requireStudentApiRoute = () =>
    requireRoleApiRoute(ROLE_GROUPS.STUDENT);

/**
 * Any authenticated user
 */
export const requireAnyUserApiRoute = () =>
    requireRoleApiRoute(ROLE_GROUPS.ALL);
