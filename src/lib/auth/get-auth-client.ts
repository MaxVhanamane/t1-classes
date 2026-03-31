import { cache } from "react"
import { createBrowserSupabaseClient } from "../supabase/supabase-client"

export type UserRole = "admin" | "teacher" | "student"

export interface AuthContext {
    userId: string
    email?: string
    role?: UserRole
}

//  Proper unknown-safe type guard
function isTimeoutError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false

    const err = error as {
        message?: unknown
        cause?: {
            code?: unknown
            name?: unknown
        }
    }

    const code =
        typeof err.cause?.code === "string" ? err.cause.code : ""
    const name =
        typeof err.cause?.name === "string" ? err.cause.name : ""
    const message =
        typeof err.message === "string" ? err.message : ""

    return (
        code === "UND_ERR_CONNECT_TIMEOUT" ||
        name === "ConnectTimeoutError" ||
        message.includes("fetch failed")
    )
}

// small delay helper
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//  Cached per request
export const getAuthClient = cache(async (): Promise<AuthContext | null> => {
    const supabase = createBrowserSupabaseClient()

    const MAX_RETRIES = 2

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const { data, error } = await supabase.auth.getClaims()

            // If Supabase responded → no retry
            if (error || !data?.claims) {
                return null
            }

            const claims = data.claims

            return {
                userId: claims.sub,
                email: claims.email,
                role: claims.app_role as UserRole | undefined,
            }

        } catch (error: unknown) {
            const timeout = isTimeoutError(error)

            if (timeout && attempt < MAX_RETRIES) {
                const delay = 300 * Math.pow(2, attempt)
                await sleep(delay)
                continue
            }

            console.error("getAuth failed:", error)
            return null
        }
    }

    return null
})
