import { NextRequest, NextResponse } from "next/server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import { getQuestionsForSection } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/services/get-questions-for-section";

export async function GET(req: NextRequest) {
    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Search Params ---------- */
        const sectionId = req.nextUrl.searchParams.get("sectionId");

        if (!sectionId) {
            return NextResponse.json(
                {
                    message: "Missing sectionId",
                },
                {
                    status: 400,
                },
            );
        }

        const page = Math.max(
            1,
            Number(req.nextUrl.searchParams.get("page") ?? "1"),
        );

        /* ---------- Fetch ---------- */
        const result = await getQuestionsForSection(
            sectionId,
            page,
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "[ADMIN_SECTION_QUESTIONS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message: "Failed to fetch questions",
            },
            {
                status: 500,
            },
        );
    }
}
