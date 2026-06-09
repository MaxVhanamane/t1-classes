import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { JSONContent } from '@tiptap/react'
// ============================================================
// Types for RPC Response
// ============================================================

interface PracticeOption {
    id: string;
    option_label: string;
    option_text: JSONContent;
    is_correct: boolean;
}

interface PracticeQuestion {
    id: string;
    question: JSONContent;
    explanation: JSONContent;
    options: PracticeOption[];
}

interface PracticeSetContent {
    id: string;
    title: string;
    description: string | null;
    is_free_preview: boolean;
    course_id: string | null;
    questions: PracticeQuestion[];
}

// ============================================================
// Route Handler
// ============================================================

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ practiceSetId: string }> }
) {

    const { practiceSetId } = await params;
    const supabase = await createServerSupabaseClient();
    // const courseId = ps.topic.course_id;

    // -------------------------------------------------
    // 2. Access check (Disabled for now)
    // -------------------------------------------------
    // const access = await getCourseAccess(courseId);
    // const canAccess = access.hasAccess || ps.is_free_preview === true;
    //
    // if (!canAccess) {
    //     throw new Error("You do not have access to this content");
    // }

    try {
        // Call the optimized Supabase RPC
        const { data, error } = await supabase.rpc(
            "get_practice_set_content",
            {
                p_practice_set_id: practiceSetId,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            return Response.json(
                { message: "Practice set not accessible" },
                { status: 404 }
            );
        }

        // Cast RPC result to typed response
        const typedData = data as PracticeSetContent;

        // Cache headers for performance (safe for marketing pages)
        return new Response(JSON.stringify(typedData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control":
                    "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (err) {
        console.error("[PRACTICE_SET_ERROR]", err);

        const message =
            err instanceof Error
                ? err.message
                : "Failed to fetch practice set";

        return Response.json(
            { message },
            {
                status:
                    message === "Practice set not accessible" ? 403 : 500,
            }
        );
    }
}
