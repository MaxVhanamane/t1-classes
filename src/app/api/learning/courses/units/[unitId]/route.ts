import { getCourseUnitContent } from "@/src/lib/services/courses/get-course-unit-content";


export async function GET(
    _req: Request,
    { params }: { params: Promise<{ unitId: string }> }
) {

    const unitId = (await params).unitId;
    try {
        const content = await getCourseUnitContent(unitId);

        return Response.json(content);
    } catch (err) {
        console.error("[COURSE_UNIT_ERROR]", err);

        return Response.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Access denied",
            },
            { status: 403 }
        );
    }
}
