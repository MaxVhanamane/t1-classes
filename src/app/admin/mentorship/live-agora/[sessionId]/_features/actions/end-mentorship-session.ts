"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

interface EndMentorshipSessionInput {
    sessionId: string;
}

export async function endMentorshipSession(
    input: EndMentorshipSessionInput,
): Promise<ServerActionResponse<boolean>> {
    // 1. Auth check
    const staff = await requireStaffServerOnly();
    console.log("[END_SESSION_DEBUG] Auth passed. Current Staff ID:", staff.userId);

    try {
        const supabase = await createServerSupabaseClient();
        console.log("[END_SESSION_DEBUG] Fetching session ID:", input.sessionId);

        // 2. Fetch session to verify ownership
        const { data: session, error: sessionError } = await supabase
            .from("mentorship_sessions")
            .select("id, created_by")
            .eq("id", input.sessionId)
            .single();

        if (sessionError || !session) {
            console.error("[END_SESSION_DEBUG] Fetch failed. Error:", sessionError, "Data:", session);
            return { error: "Mentorship session not found" };
        }

        // 3. Permission check: Only the owner/moderator can end the session
        console.log("[END_SESSION_DEBUG] --- PERMISSION CHECK ---");
        console.log("[END_SESSION_DEBUG] Session created_by :", session.created_by);
        console.log("[END_SESSION_DEBUG] Action executed by :", staff.userId);

        const isModerator = session.created_by === staff.userId;
        console.log("[END_SESSION_DEBUG] isModerator result :", isModerator);

        if (!isModerator) {
            console.warn("[END_SESSION_DEBUG] Permission denied. IDs do not match.");
            return { error: "You do not have permission to end this session" };
        }

        // 4. Update Database
        console.log("[END_SESSION_DEBUG] IDs match. Updating ends_at timestamp...");
        const { error: updateError } = await supabase
            .from("mentorship_sessions")
            .update({
                ends_at: new Date().toISOString(),
            })
            .eq("id", input.sessionId);

        if (updateError) {
            console.error("[END_MENTORSHIP_SESSION_UPDATE_ERROR]", updateError);
            return { error: "Failed to update session status" };
        }

        console.log("[END_SESSION_DEBUG] Successfully ended session in database.");
        return { data: true };
    } catch (error) {
        console.error("[END_MENTORSHIP_SESSION_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
