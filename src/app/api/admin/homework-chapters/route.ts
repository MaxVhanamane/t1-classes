import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { Subject, TargetExam } from "@/src/app/admin/batches/_features/zod-schema/schema";
import { HomeworkChapter } from "@/src/app/admin/homework/[chapterId]/_features/types/homework";
import { HomeworkChapterListResponse } from "@/src/app/admin/homework/_features/types/homework";

const PAGE_SIZE = 10;

type RawHomeworkChapterRow = {
    id: string;
    class_level: number | null;
    subject: string;
    target_exam: string | null;
    chapter_number: number | null;
    chapter_name: string;
    created_at: string;
};

export async function GET(request: NextRequest) {
    try {
        const auth = await requireStaffApiRoute();
        if (!auth.authorized) return auth.response;

        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search") ?? "";
        const subject = searchParams.get("subject") ?? null;
        const targetExam = searchParams.get("targetExam") ?? null;
        const classLevel = searchParams.get("classLevel") ?? null;

        const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const supabase = await createServerSupabaseClient();

        let countQuery = supabase.from("homework_chapters").select("*", { count: "exact", head: true });
        let dataQuery = supabase.from("homework_chapters").select("*");

        if (search.trim()) {
            countQuery = countQuery.ilike("chapter_name", `%${search.trim()}%`);
            dataQuery = dataQuery.ilike("chapter_name", `%${search.trim()}%`);
        }
        if (subject) {
            countQuery = countQuery.eq("subject", subject);
            dataQuery = dataQuery.eq("subject", subject);
        }
        if (targetExam) {
            countQuery = countQuery.eq("target_exam", targetExam);
            dataQuery = dataQuery.eq("target_exam", targetExam);
        }
        if (classLevel) {
            countQuery = countQuery.eq("class_level", Number(classLevel));
            dataQuery = dataQuery.eq("class_level", Number(classLevel));
        }

        const [countResult, dataResult] = await Promise.all([
            countQuery,
            dataQuery.order("created_at", { ascending: false }).range(from, to),
        ]);

        if (countResult.error) {
            return NextResponse.json({ message: countResult.error.message }, { status: 500 });
        }
        if (dataResult.error) {
            return NextResponse.json({ message: dataResult.error.message }, { status: 500 });
        }

        const totalCount = countResult.count ?? 0;
        const rows = (dataResult.data as unknown as RawHomeworkChapterRow[]) || [];

        const items: HomeworkChapter[] = rows.map((row) => ({
            id: row.id,
            class_level: row.class_level,
            subject: row.subject as Subject,
            target_exam: row.target_exam as TargetExam | null,
            chapter_number: row.chapter_number,
            chapter_name: row.chapter_name,
            created_at: row.created_at,
        }));

        const response: HomeworkChapterListResponse = {
            items,
            totalCount,
            page,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(totalCount / PAGE_SIZE),
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ message: "Failed to load chapters" }, { status: 500 });
    }
}
