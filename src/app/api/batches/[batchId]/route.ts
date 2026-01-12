import { getBatchDetails } from "@/src/lib/services/batches/get-batch-details"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    const batchId = (await params).batchId

    try {
        const data = await getBatchDetails(batchId)
        return Response.json(data)
    } catch (err) {
        console.error("[BATCH_DETAILS_ERROR]", err)

        return Response.json(
            {
                message:
                    err instanceof Error ? err.message : "Unauthorized",
            },
            {
                status: err instanceof Error &&
                    (err.message === "BATCH_ACCESS_DENIED" ||
                        err.message === "BATCH_NOT_FOUND")
                    ? 403
                    : 500,
            }
        )
    }
}
