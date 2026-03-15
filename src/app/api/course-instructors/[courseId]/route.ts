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
    params: Promise<{ courseId: string }>;
};

export async function GET(_: Request, { params }: Params) {
    const { courseId } = await params;

    if (!courseId) {
        return NextResponse.json(
            { message: "Course ID is required" },
            { status: 400 }
        );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("course_instructors")
        .select(`
      instructors (
        id,
        full_name,
        qualification,
        bio,
        profile_image
      )
    `)
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Instructors fetch error:", error);
        return NextResponse.json(
            { message: "Failed to fetch instructors" },
            { status: 500 }
        );
    }

    // Flatten relation
    const instructors =
        data?.map((row) => row.instructors).filter(Boolean) ?? [];

    return NextResponse.json(instructors);
}
