import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getExploreBatchesService } from "@/src/lib/services/batches/get-explore-batches"

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()

        const batches = await getExploreBatchesService(
            supabase,
        )

        return NextResponse.json(batches)
    } catch (error) {
        console.error("Explore batches API error:", error)

        return NextResponse.json(
            { error: "Failed to fetch explore batches" },
            { status: 500 }
        )
    }
}
