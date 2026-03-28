import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug;

    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .rpc("get_marketing_course_outline_by_slug", { p_slug: slug });

        if (error) {
            console.error("[COURSE_OUTLINE_ERROR]", error);
            return Response.json(
                { message: "Failed to load course outline" },
                { status: 500 }
            );
        }

        if (!data) {
            return Response.json(
                { message: "Course not found" },
                { status: 404 }
            );
        }

        return Response.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });

    } catch (err) {
        console.error("[COURSE_OUTLINE_ERROR]", err);
        return Response.json(
            {
                message: err instanceof Error
                    ? err.message
                    : "Failed to load course outline",
            },
            { status: 500 }
        );
    }
}
