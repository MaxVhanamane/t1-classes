"use client"

import { useEffect, useState } from "react"
import { createBrowserSupabaseClient } from "../lib/supabase/supabase-client"

export type UserRole = "admin" | "teacher" | "student"

export interface ClientAuth {
    userId: string | null
    email: string | null
    role: UserRole | null
    loading: boolean
}

export function useAuth(): ClientAuth {
    const [auth, setAuth] = useState<ClientAuth>({
        userId: null,
        email: null,
        role: null,
        loading: true,
    })

    useEffect(() => {
        const supabase = createBrowserSupabaseClient()

        let mounted = true

        async function load() {
            try {
                const { data } = await supabase.auth.getClaims()

                const claims = data?.claims

                if (!mounted) return

                setAuth({
                    userId: claims?.sub ?? null,
                    email: claims?.email ?? null,
                    role: (claims?.app_role as UserRole) ?? null,
                    loading: false,
                })
            } catch {
                if (!mounted) return
                setAuth({
                    userId: null,
                    email: null,
                    role: null,
                    loading: false,
                })
            }
        }

        void load()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async () => {
            const { data } = await supabase.auth.getClaims()
            const claims = data?.claims

            if (!mounted) return

            setAuth({
                userId: claims?.sub ?? null,
                email: claims?.email ?? null,
                role: (claims?.app_role as UserRole) ?? null,
                loading: false,
            })
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return auth
}
