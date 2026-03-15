import { getLearningCourseOutline } from "@/src/lib/services/courses/get-learning-course-outline";
import { resolveCourseSlug } from "@/src/lib/services/courses/resolve-course-slug";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug;

    try {
        const { id } = await resolveCourseSlug(slug);


        const outline = await getLearningCourseOutline(id);

        return Response.json(outline, {
            status: 200,
        });
    } catch (err) {
        console.error("[COURSE_OUTLINE_ERROR]", err);

        return Response.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to load course outline",
            },
            { status: 400 }
        );
    }
}
