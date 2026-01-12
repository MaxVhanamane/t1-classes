import { getPracticeSetContent } from "@/src/lib/services/courses/get-practice-set-content";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ practiceSetId: string }> }
) {
    const practiceSetId = (await params).practiceSetId;
    try {
        const data = await getPracticeSetContent(practiceSetId);
        return Response.json(data);
    } catch (err) {
        console.error("[PRACTICE_SET_ERROR]", err);

        return Response.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Unauthorized",
            },
            { status: 403 }
        );
    }
}
