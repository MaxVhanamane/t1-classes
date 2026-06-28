import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { NextResponse } from "next/server";

export type CourseInstructorType = {
    id: string;

    full_name: string;

    qualification?: string | null;

    bio?: string | null;

    profile_image?: string | null;
};

type Params = {
    params: Promise<{
        courseId: string;
    }>;
};

export async function GET(
    _: Request,
    { params }: Params,
) {
    const { courseId } =
        await params;

    if (!courseId) {
        return NextResponse.json(
            {
                message:
                    "Course ID is required",
            },
            {
                status: 400,
            },
        );
    }

    const supabase =
        await createServerSupabaseClient();

    const { data, error } =
        await supabase.rpc(
            "get_public_course_instructors",
            {
                p_course_id:
                    courseId,
            },
        );

    if (error) {
        console.error(
            "Public course instructors fetch error:",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch instructors",
            },
            {
                status: 500,
            },
        );
    }

    return NextResponse.json(
        data satisfies CourseInstructorType[],
    );
}
