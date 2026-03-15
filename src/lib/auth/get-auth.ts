import "server-only"
import { createServerSupabaseClient } from "../supabase/supabase-server"
export type UserRole = "admin" | "teacher" | "student"
export interface AuthContext {
    userId: string
    email?: string
    role?: UserRole
}
export async function getAuth(): Promise<AuthContext | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.getClaims()

    if (error || !data?.claims) {
        return null
    }

    const claims = data.claims

    return {
        userId: claims.sub,
        email: claims.email,
        role: claims.app_role,
    }
}
