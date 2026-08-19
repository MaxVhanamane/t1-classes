import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import {
    HomeworkMaterial,
    HomeworkMaterialListResponse,
    HomeworkType,
    HomeworkDifficulty,
} from "@/src/app/admin/homework/[chapterId]/_features/types/homework";
import { Subject, TargetExam } from "@/src/app/admin/batches/_features/zod-schema/schema";

const PAGE_SIZE = 10;

type RawHomeworkMaterialRow = {
    id: string;
    chapter_id: string;
    title: string;
    description: string | null;
    homework_type: string;
    difficulty: string;
    file_path: string;
    file_size: number | null;
    solution_file_path: string | null;
    solution_file_size: number | null;
    created_at: string;
    chapter:
    | {
        chapter_name: string;
        class_level: number | null;
        subject: Subject;
        target_exam: TargetExam | null;
    }
    | {
        chapter_name: string;
        class_level: number | null;
        subject: Subject;
        target_exam: TargetExam | null;
    }[];
};

export async function GET(request: NextRequest) {
    try {
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search") ?? "";
        const targetExam = searchParams.get("targetExam") ?? null;
        const subject = searchParams.get("subject") ?? null;
        const classLevel = searchParams.get("classLevel") ?? null;
        const chapterId = searchParams.get("chapterId") ?? null;
        const homeworkType = searchParams.get("homeworkType") ?? null;
        const difficulty = searchParams.get("difficulty") ?? null;

        const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const supabase = await createServerSupabaseClient();

        let countQuery = supabase
            .from("homework_materials")
            .select("*, chapter:homework_chapters!inner(*)", {
                count: "exact",
                head: true,
            });

        let dataQuery = supabase.from("homework_materials").select(`
        id, title, description, homework_type, difficulty, file_path, file_size, solution_file_path, solution_file_size, created_at,
        chapter_id,
        chapter:homework_chapters!inner(chapter_name, class_level, subject, target_exam)
      `);

        if (search.trim()) {
            countQuery = countQuery.ilike("title", `%${search.trim()}%`);
            dataQuery = dataQuery.ilike("title", `%${search.trim()}%`);
        }

        if (chapterId) {
            countQuery = countQuery.eq("chapter_id", chapterId);
            dataQuery = dataQuery.eq("chapter_id", chapterId);
        }

        if (homeworkType) {
            countQuery = countQuery.eq("homework_type", homeworkType);
            dataQuery = dataQuery.eq("homework_type", homeworkType);
        }

        if (difficulty) {
            countQuery = countQuery.eq("difficulty", difficulty);
            dataQuery = dataQuery.eq("difficulty", difficulty);
        }

        if (subject) {
            countQuery = countQuery.eq("homework_chapters.subject", subject);
            dataQuery = dataQuery.eq("homework_chapters.subject", subject);
        }

        if (classLevel) {
            countQuery = countQuery.eq("homework_chapters.class_level", Number(classLevel));
            dataQuery = dataQuery.eq("homework_chapters.class_level", Number(classLevel));
        }

        if (targetExam) {
            countQuery = countQuery.eq("homework_chapters.target_exam", targetExam);
            dataQuery = dataQuery.eq("homework_chapters.target_exam", targetExam);
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

        const rows: RawHomeworkMaterialRow[] = Array.isArray(dataResult.data)
            ? (dataResult.data as unknown as RawHomeworkMaterialRow[])
            : [];

        const items: HomeworkMaterial[] = rows.map((row) => {
            const chapterData = Array.isArray(row.chapter) ? row.chapter[0] : row.chapter;

            return {
                id: row.id,
                chapter_id: row.chapter_id,
                title: row.title,
                description: row.description,
                homework_type: row.homework_type as HomeworkType,
                difficulty: row.difficulty as HomeworkDifficulty,
                file_path: row.file_path,
                file_size: row.file_size ?? 0,
                solution_file_path: row.solution_file_path,
                solution_file_size: row.solution_file_size,
                created_at: row.created_at,
                chapter: chapterData,
            };
        });

        const response: HomeworkMaterialListResponse = {
            items,
            totalCount,
            page,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(totalCount / PAGE_SIZE),
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ message: "Failed to load homework materials" }, { status: 500 });
    }
}
