import { loadAttempt } from "@/src/app/student/tests/attempt/[attemptId]/_features/server/load-attempt";
import { NextResponse } from "next/server";


export async function GET(
    _req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const { attemptId } = await params;
    const data = await loadAttempt(attemptId);

    const status = data.kind === "denied" && data.reason === "not_found" ? 404 : 200;

    return NextResponse.json(data, { status });
}
