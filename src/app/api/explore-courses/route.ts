import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"
import { getExploreCoursesForUser } from "@/src/lib/services/courses/get-explore-courses-for-user"

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const user = await getCurrentUser()

        const courses = await getExploreCoursesForUser(supabase, user?.id);
        return NextResponse.json(courses)
    } catch (error) {
        console.error("Explore courses API error:", error)

        return NextResponse.json(
            { error: "Failed to fetch explore courses" },
            { status: 500 }
        )
    }
}
