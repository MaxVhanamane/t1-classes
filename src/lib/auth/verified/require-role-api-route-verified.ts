import "server-only";
import { NextResponse } from "next/server";
import { ROLE_GROUPS } from "../claims/role-groups";
import { AuthContext, UserRole } from "../types/auth.types";
import { getVerifiedAuthIfHasRole } from "./get-verifed-auth-if-has-role";

/**
 * Ensures the user is authenticated and has one of the allowed roles.
 * Returns HTTP responses instead of redirecting.
 *
 * Intended ONLY for:
 * - Route Handlers (`route.ts`)
 *
 * DO NOT USE in:
 * - Server Actions
 * - Server Components
 *
 * This function does NOT call `redirect()`.
 * Instead, it returns appropriate HTTP responses (401 / 403).
 */
export async function requireRoleApiRouteVerified(
    roles: readonly UserRole[]
): Promise<
    | { authorized: true; user: AuthContext }
    | { authorized: false; response: NextResponse }
> {
    const authState = await getVerifiedAuthIfHasRole(roles);

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
export const requireStaffApiRouteVerified = () =>
    requireRoleApiRouteVerified(ROLE_GROUPS.STAFF);

/**
 * ADMIN only
 */
export const requireAdminApiRouteVerified = () =>
    requireRoleApiRouteVerified(ROLE_GROUPS.ADMIN);

/**
 * STUDENT only
 */
export const requireStudentApiRouteVerified = () =>
    requireRoleApiRouteVerified(ROLE_GROUPS.STUDENT);

/**
 * Any authenticated user
 */
export const requireAnyUserApiRouteVerified = () =>
    requireRoleApiRouteVerified(ROLE_GROUPS.ALL);
