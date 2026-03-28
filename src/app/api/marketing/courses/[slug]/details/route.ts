import { getCourseBySlug } from "./server/get-course-by-slug";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const course = await getCourseBySlug(slug);

    if (!course) {
        return Response.json(
            { message: "Course not found" },
            { status: 404 }
        );
    }

    return Response.json(course, { status: 200 });
}
