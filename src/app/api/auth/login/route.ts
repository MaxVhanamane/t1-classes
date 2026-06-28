import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";

type SupabaseJwt = {
    session_id: string;
};

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Client used for sign in
        const authClient =
            await createServiceRoleSupabaseClient();

        const { data, error } =
            await authClient.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        const session = data.session;
        const user = data.user;

        const decoded = jwtDecode<SupabaseJwt>(
            session.access_token
        );

        const sessionId = decoded.session_id;

        // IMPORTANT:
        // Create a fresh service-role client.
        // The previous client now has the user's session attached.
        const adminClient =
            await createServiceRoleSupabaseClient();


        const { error: sessionError } =
            await adminClient.rpc(
                "expire_other_sessions",
                {
                    p_user_id: user.id,
                    p_current_session: sessionId,
                }
            );

        if (sessionError) {
            console.error(
                "Session cleanup failed:",
                sessionError
            );
        }

        return NextResponse.json({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user,
        });
    } catch {
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        );
    }
}
