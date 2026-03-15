import "server-only"
import { createServerSupabaseClient } from "../supabase/supabase-server"
import { getAuth } from "./get-auth"

export async function getUserProfile() {
    const auth = await getAuth()
    if (!auth) throw new Error("Unauthorized")

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("users")
        .select(`
      id,
      full_name,
      phone,
      role,
      status,
      profile_image,
      created_at,
      email
    `)
        .eq("id", auth.userId)
        .single()

    if (error) {
        throw new Error("Failed to load user profile")
    }

    return data
}
