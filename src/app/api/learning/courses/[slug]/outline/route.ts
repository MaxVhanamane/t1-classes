import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    CourseOutline,
    CourseChapter,
    CourseTopic,
    CourseUnitOutline,
    PracticeSetOutline,
} from "@/src/types/course-outline.types";
import { CourseAccess } from "@/src/lib/services/courses/course-access";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug;

    try {

        const supabase = await createServerSupabaseClient();

        const [accessResult, outlineResult] = await Promise.all([
            supabase.rpc("get_course_access", { p_slug: slug }),
            supabase.rpc("get_learning_course_outline", { p_slug: slug }),
        ]);

        if (accessResult.error) {
            console.error("[COURSE_ACCESS_ERROR]", accessResult.error);
            return Response.json(
                { message: "Failed to check course access" },
                { status: 500 }
            );
        }

        if (outlineResult.error) {
            console.error("[COURSE_OUTLINE_ERROR]", outlineResult.error);
            return Response.json(
                { message: "Failed to load course outline" },
                { status: 500 }
            );
        }

        const access = accessResult.data as CourseAccess | null;
        const raw = outlineResult.data as Omit<CourseOutline, "hasAccess"> | null;

        if (!raw) {
            return Response.json(
                { message: "Course not found" },
                { status: 404 }
            );
        }

        if (!access || !access.hasAccess) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chapters: CourseChapter[] = raw.chapters.map((chapter: CourseChapter) => ({
            ...chapter,
            topics: chapter.topics.map((topic: CourseTopic) => ({
                ...topic,
                units: topic.units.map((unit: CourseUnitOutline): CourseUnitOutline => ({
                    id: unit.id,
                    title: unit.title,
                    unitType: unit.unitType,
                    durationMinutes: unit.durationMinutes,
                    isFreePreview: false,
                    access: "accessible",
                })),
                practiceSets: topic.practiceSets.map((ps: PracticeSetOutline): PracticeSetOutline => ({
                    id: ps.id,
                    title: ps.title,
                    access: "accessible",
                    isFreePreview: false,
                })),
            })),
        }));


        const result: CourseOutline = {
            courseId: raw.courseId,
            hasAccess: true,
            chapters,
        };

        return Response.json(result, { status: 200 });

    } catch (err) {
        console.error("[COURSE_OUTLINE_ERROR]", err);

        return Response.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to load course outline",
            },
            { status: 500 }
        );
    }
}
