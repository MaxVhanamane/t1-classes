import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getMyEnrollmentsService } from "@/src/lib/services/enrollments/get-my-enrollments"
import { getAuth } from "@/src/lib/auth/get-auth"


export async function GET() {
    const auth = await getAuth()

    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    const enrollments = await getMyEnrollmentsService(
        supabase,
        auth.userId
    )

    return NextResponse.json(enrollments)
}
