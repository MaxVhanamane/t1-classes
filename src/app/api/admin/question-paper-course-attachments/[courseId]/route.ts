import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

type RouteContext = {
    params: Promise<{
        courseId: string;
    }>;
};

export async function GET(
    _request: Request,
    { params }: RouteContext,
) {
    try {
        const auth =
            await requireAdminApiRoute();

        if (
            !auth.authorized
        ) {
            return auth.response;
        }

        const { courseId } =
            await params;

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase
            .from("courses")
            .select(`
        id,
        title,
        class_level,
        target_exam
      `)
            .eq(
                "id",
                courseId,
            )
            .single();

        if (error) {
            console.error(
                "[GET_COURSE_ATTACHMENT_DETAILS_ERROR]",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Course not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            data,
        );
    } catch (
    error
    ) {
        console.error(
            "[GET_COURSE_ATTACHMENT_DETAILS_FATAL]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load course details.",
            },
            {
                status: 500,
            },
        );
    }
}
