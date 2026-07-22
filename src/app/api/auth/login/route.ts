import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
// 1. Import BOTH clients
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";

type SupabaseJwt = {
    session_id: string;
};

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // 2. Use the STANDARD client for login. 
        // This enforces the 10-requests-per-5-minutes rate limit based on the user's IP.
        const authClient = await createServerSupabaseClient();

        const { data, error } = await authClient.auth.signInWithPassword({
            email,
            password,
        });
        // const reqHeaders = await headers();

        // 1. THE SECURITY FIX:
        // 'x-real-ip' is forcefully set by Vercel's edge network. A hacker cannot spoof this.
        // We fallback to 'x-forwarded-for' ONLY for local development (localhost).
        // const trueUserIp = reqHeaders.get("x-real-ip") || reqHeaders.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
        // console.log("x-real-ip", reqHeaders.get("x-real-ip"));
        // console.log("x-forwarded-for", reqHeaders.get("x-forwarded-for"));
        // console.log("trueUserIp", trueUserIp);
        if (error) {
            const status = error.status || 401;

            // Intercept Supabase Rate Limit Lockout (Status 429)
            if (status === 429 || error.message.toLowerCase().includes("rate limit")) {
                return NextResponse.json(
                    { error: "Too many failed attempts. For your security, please wait 5 minutes before trying again." },
                    { status: 429 }
                );
            }

            // Security Best Practice: Never reveal if the email or password specifically was wrong
            return NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
            );
        }

        const session = data.session;
        const user = data.user;

        const decoded = jwtDecode<SupabaseJwt>(session.access_token);
        const sessionId = decoded.session_id;

        // 3. Use the SERVICE ROLE client ONLY for the secure backend cleanup task
        const adminClient = await createServiceRoleSupabaseClient();

        const { error: sessionError } = await adminClient.rpc(
            "expire_other_sessions",
            {
                p_user_id: user.id,
                p_current_session: sessionId,
            }
        );

        if (sessionError) {
            console.error("Session cleanup failed:", sessionError);
        }

        return NextResponse.json({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user,
        });
    } catch (err) {
        console.error("Unexpected error in login API route:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}
