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
        const message =
            err instanceof Error
                ? err.message
                : "Something went wrong";

        // Not found
        if (message === "Course unit not found") {
            return Response.json(
                { message },
                { status: 404 }
            );
        }

        // Forbidden / no access
        if (
            message ===
            "You do not have access to this content" ||
            message === "Content not available"
        ) {
            return Response.json(
                { message },
                { status: 403 }
            );
        }

        // Unexpected server error
        return Response.json(
            { message: "Failed to load unit" },
            { status: 500 }
        );
    }
}
