import "server-only"
import { getAuth, UserRole } from "./get-auth"


export interface AuthContext {
    userId: string
    email?: string
    role?: UserRole
}

export async function getAuthIfHasRole(
    allowedRoles: readonly UserRole[]
): Promise<AuthContext | null> {

    const auth = await getAuth()

    if (!auth) {
        return null
    }

    if (!auth.role || !allowedRoles.includes(auth.role)) {
        return null
    }

    return auth
}
