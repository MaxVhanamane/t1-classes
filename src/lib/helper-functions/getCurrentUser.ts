import "server-only"

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "../supabase/supabase-server"
import { ROUTES } from "../constants/route-constants"
import { AppUser } from "@/src/types/user"


export async function getCurrentUser(): Promise<AppUser> {
    const supabase = await createServerSupabaseClient()

    // 1. Get auth user
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
        redirect(ROUTES.login)
    }

    // 2. Get public.users row
    const { data, error: userError } = await supabase
        .from("users")
        .select(
            `
      id,
      full_name,
      phone,
      role,
      status,
      profile_image,
      created_at,
      email
    `
        )
        .eq("id", authUser.id)
        .single()

    if (userError || !data) {
        redirect(ROUTES.login)
    }

    // 3. Status gate
    if (data.status !== "active") {
        redirect(ROUTES.inactiveUser)
    }

    return data as AppUser
}
