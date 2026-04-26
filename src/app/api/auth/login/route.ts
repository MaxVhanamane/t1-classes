import { NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode";
import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role"
type SupabaseJwt = {
    session_id: string
}
export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        const supabaseAdmin = await createServiceRoleSupabaseClient()

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        const session = data.session
        const user = data.user

        const decoded = jwtDecode<SupabaseJwt>(session.access_token)
        const sessionId = decoded.session_id


        // expire other sessions
        const { error: sessionError } = await supabaseAdmin.rpc(
            "expire_other_sessions",
            {
                p_user_id: user.id,
                p_current_session: sessionId,
            }
        )

        if (sessionError) {
            console.error("Session cleanup failed:", sessionError)
        }


        return NextResponse.json({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user,
        })
    } catch {
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        )
    }
}
