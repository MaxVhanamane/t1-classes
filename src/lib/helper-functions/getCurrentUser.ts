import { createServerSupabaseClient } from "../supabase/supabase-server";


export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();

    // 1 Get auth user
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
        throw new Error("Not authenticated");
    }

    // 2 Get public.users row
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

    if (userError || !user) {
        throw new Error("User profile not found");
    }

    // 3 Status checks
    if (user.status !== "active") {
        throw new Error("User is not active");
    }

    return user;
}
