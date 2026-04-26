import { getQuestionsForSection } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/services/get-questions-for-section";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const auth = await requireStaffApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const sectionId = req.nextUrl.searchParams.get("sectionId");

    if (!sectionId) {
        return NextResponse.json({ error: "Missing sectionId" }, { status: 400 });
    }

    try {
        const questions = await getQuestionsForSection(sectionId);

        return NextResponse.json(questions);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}
