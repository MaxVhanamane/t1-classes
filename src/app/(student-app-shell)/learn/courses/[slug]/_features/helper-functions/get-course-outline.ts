import "server-only";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    CourseOutline,
    CourseChapter,
    CourseUnitOutline,
    PracticeSetOutline,
} from "@/src/types/course-outline.types";
import { CourseAccess } from "@/src/lib/services/courses/course-access";

type CourseOutlineResult =
    | { success: true; outline: CourseOutline }
    | { success: false; status: number; message: string };

export async function getCourseOutlineForPlayer(
    slug: string
): Promise<CourseOutlineResult> {
    try {
        const supabase = await createServerSupabaseClient();

        const [accessResult, outlineResult] = await Promise.all([
            supabase.rpc("get_course_access", { p_slug: slug }),
            supabase.rpc("get_learning_course_outline", { p_slug: slug }),
        ]);

        //  RPC-level errors (DB / network / auth issues)
        if (accessResult.error) {
            console.error("[COURSE_ACCESS_ERROR]", accessResult.error);
            return {
                success: false,
                status: 500,
                message: "Failed to check course access",
            };
        }

        if (outlineResult.error) {
            console.error("[COURSE_OUTLINE_ERROR]", outlineResult.error);
            return {
                success: false,
                status: 500,
                message: "Failed to load course outline",
            };
        }

        const access = accessResult.data as CourseAccess | null;
        const raw = outlineResult.data as Omit<CourseOutline, "hasAccess"> | null;

        //  IMPORTANT: handle invalid / inactive slug
        if (!raw) {
            return {
                success: false,
                status: 404,
                message: "Course not found",
            };
        }

        //  Access check AFTER confirming course exists
        if (!access || !access.hasAccess) {
            return {
                success: false,
                status: 401,
                message: "Unauthorized",
            };
        }

        //  Transform data
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
                practiceSets: topic.practiceSets.map(
                    (ps): PracticeSetOutline => ({
                        id: ps.id,
                        title: ps.title,
                        access: "accessible",
                        isFreePreview: false,
                    })
                ),
            })),
        }));

        return {
            success: true,
            outline: {
                courseId: raw.courseId,
                hasAccess: true,
                chapters,
            },
        };
    } catch (err) {
        console.error("[COURSE_OUTLINE_FATAL]", err);

        return {
            success: false,
            status: 500,
            message:
                err instanceof Error ? err.message : "Something went wrong",
        };
    }
}
