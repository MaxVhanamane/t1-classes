import "server-only";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    CourseOutline,
    CourseChapter,
    CourseUnitOutline,
    PracticeSetOutline,
} from "@/src/types/course-outline.types";
import { CourseAccess } from "@/src/lib/services/courses/course-access";
import { cacheLife, cacheTag } from "next/cache";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";

type CourseOutlineResult =
    | { success: true; outline: CourseOutline }
    | { success: false; status: number; message: string };

// Stateless — safe to cache, no cookies/headers/auth context
// Transform is also cached since access: "accessible" + isFreePreview: false
// is always true for any enrolled student (all-or-nothing enrollment model)
export async function getCourseOutline(slug: string): Promise<{
    courseId: string;
    chapters: CourseChapter[];
} | null> {
    "use cache";
    cacheLife("aggressive");
    cacheTag(`course-outline:enrolled:${slug}`);
    console.log("getCourseOutline called", `course-outline:enrolled:${slug}`)

    const supabase = createStaticSupabaseClient();

    const { data, error } = await supabase.rpc("get_learning_course_outline", {
        p_slug: slug,
    });

    if (error) throw error;
    if (!data) return null;

    const raw = data as Omit<CourseOutline, "hasAccess">;

    const chapters: CourseChapter[] = raw.chapters.map((chapter) => ({
        ...chapter,
        topics: chapter.topics.map((topic) => ({
            ...topic,
            units: topic.units.map((unit): CourseUnitOutline => ({
                id: unit.id,
                title: unit.title,
                unitType: unit.unitType,
                durationMinutes: unit.durationMinutes,
                isFreePreview: false,
                access: "accessible",
            })),
            practiceSets: topic.practiceSets.map((ps): PracticeSetOutline => ({
                id: ps.id,
                title: ps.title,
                access: "accessible",
                isFreePreview: false,
            })),
        })),
    }));

    return { courseId: raw.courseId, chapters };
}

export async function getCourseOutlineForPlayer(
    slug: string
): Promise<CourseOutlineResult> {
    try {
        const supabase = await createServerSupabaseClient();

        const [accessResult, outline] = await Promise.all([
            supabase.rpc("get_course_access", { p_slug: slug }),
            getCourseOutline(slug).catch(() => null),
        ]);

        if (accessResult.error) {
            console.error("[COURSE_ACCESS_ERROR]", accessResult.error);
            return { success: false, status: 500, message: "Failed to check course access" };
        }

        if (!outline) {
            return { success: false, status: 404, message: "Course not found" };
        }

        const access = accessResult.data as CourseAccess | null;

        if (!access || !access.hasAccess) {
            return { success: false, status: 401, message: "Unauthorized" };
        }

        return {
            success: true,
            outline: { ...outline, hasAccess: true },
        };

    } catch (err) {
        console.error("[COURSE_OUTLINE_FATAL]", err);
        return {
            success: false,
            status: 500,
            message: err instanceof Error ? err.message : "Something went wrong",
        };
    }
}
