import { getExploreBatchDetailBySlugService } from "@/src/lib/services/batches/get-explore-batch-details-by-slug-service"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { NextRequest, NextResponse } from "next/server"


export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params

        if (!slug || typeof slug !== "string") {
            return NextResponse.json(
                { error: "Invalid batch slug" },
                { status: 400 }
            )
        }

        const supabase = await createServerSupabaseClient()

        const batch = await getExploreBatchDetailBySlugService(
            supabase,
            slug
        )



        if (!batch) {
            return NextResponse.json(
                { error: "Batch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(batch, { status: 200 })
    } catch (error) {
        console.error("Explore batch detail API error:", error)

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
