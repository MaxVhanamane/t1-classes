"use server"
import { getAuth } from "../auth/get-auth";
import { createServerSupabaseClient } from "../supabase/supabase-server";

export async function getUserForMenu() {
    const supabase = await createServerSupabaseClient();

    const authUser = await getAuth()

    if (!authUser) return null;

    const { data } = await supabase
        .from("users")
        .select("id, full_name, email, profile_image")
        .eq("id", authUser.userId)
        .single();

    if (!data) return null;

    // RETURN A PLAIN OBJECT
    return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        profile_image: data.profile_image,
    };
}
