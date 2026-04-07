import { connection, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getExploreCoursesForUser } from "@/src/lib/services/courses/get-explore-courses-for-user"
export async function GET() {
    await connection() // tells Next.js this route requires a live connection, skips prerender
    try {
        const supabase = await createServerSupabaseClient()

        const courses = await getExploreCoursesForUser(supabase);
        return NextResponse.json(courses)
    } catch (error) {
        console.error("Explore courses API error:", error)

        return NextResponse.json(
            { error: "Failed to fetch explore courses" },
            { status: 500 }
        )
    }
}
