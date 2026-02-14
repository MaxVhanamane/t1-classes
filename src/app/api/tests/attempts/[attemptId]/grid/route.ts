import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent"

type AttemptRow = {
    id: string
    user_id: string
    status: "in_progress" | "submitted" | "expired"
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentStudent()

    const { attemptId } = await params

    /**
     * 1. Load attempt
     */
    const { data: attempt } = await supabase
        .from("test_attempts")
        .select("id, user_id, status")
        .eq("id", attemptId)
        .single()

    if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    const typedAttempt = attempt as AttemptRow

    /**
     * 2. Ownership gate
     */
    if (typedAttempt.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /**
     * 3. Load grid
     */
    const { data, error } = await supabase
        .from("test_attempt_question_state")
        .select("question_id, section_id, state")
        .eq("attempt_id", typedAttempt.id)
        .order("section_order", { ascending: true })
        .order("question_order", { ascending: true })


    if (error) {
        return NextResponse.json(
            { error: "Failed to load grid" },
            { status: 500 }
        )
    }

    /**
     * 4. Success
     */
    return NextResponse.json({
        ok: true,
        attemptId: typedAttempt.id,
        grid: data,
    })
}
