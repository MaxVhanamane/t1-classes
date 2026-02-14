import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"
import { getMyEnrollmentsService } from "@/src/lib/services/enrollments/get-my-enrollments"

export async function GET() {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentUser()
    console.log("userrrrrrrrrr", user)
    if (!user) {
        return NextResponse.json([], { status: 200 })
    }

    const enrollments = await getMyEnrollmentsService(
        supabase,
        user.id
    )

    return NextResponse.json(enrollments)
}
