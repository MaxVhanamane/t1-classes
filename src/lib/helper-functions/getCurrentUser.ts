import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../supabase/supabase-server";
import { ROUTES } from "../constants/route-constants";


export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();

    // 1 Get auth user
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
        redirect(ROUTES.login);

    }

    // 2 Get public.users row
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

    if (userError || !user) {
        redirect(ROUTES.login);

    }

    // 3 Status checks
    if (user.status !== "active") {
        redirect(ROUTES.inactiveUser);

    }

    return user;
}
