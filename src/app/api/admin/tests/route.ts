import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type {
    TestRow,
    TestType,
} from "@/src/app/admin/tests/_features/types/test.types";

const PAGE_SIZE = 20;

type TestQueryRow = {
    id: string;
    title: string;
    description: string | null;
    test_type: TestType;
    created_at: string;
    is_locked: boolean;
    total_sections: number;
    total_questions: number;
    total_marks: number;
    created_by: {
        id: string;
        full_name: string;
    } | null;
    // NEW: Added for the Supabase join
    test_sections?: Array<{
        subject_label: string;
    }>;
};

export async function GET(request: Request) {
    await connection();

    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Client ---------- */
        const supabase = await createServerSupabaseClient();

        /* ---------- Search Params ---------- */
        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() ?? "";
        const createdBy = searchParams.get("createdBy") ?? "me";
        const testType = searchParams.get("testType") ?? "";
        const locked = searchParams.get("locked") ?? "all";
        const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

        const pageSize = PAGE_SIZE;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        /* ---------- Query ---------- */
        let query = supabase
            .from("tests")
            .select(
                `
          id,
          title,
          description,
          test_type,
          created_at,
          is_locked,
          total_sections,
          total_questions,
          total_marks,
          created_by:users!tests_created_by_fkey (
            id,
            full_name
          ),
          test_sections (
            subject_label
          )
        `,
                {
                    count: "exact",
                }
            );

        /* ---------- Permissions ---------- */
        if (auth.user.role !== "admin") {
            query = query.eq("created_by", auth.user.userId);
        } else if (createdBy === "me") {
            query = query.eq("created_by", auth.user.userId);
        } else if (createdBy !== "all") {
            query = query.eq("created_by", createdBy);
        }

        /* ---------- Filters ---------- */
        if (search) {
            query = query.or(
                `title.ilike.%${search}%,description.ilike.%${search}%`
            );
        }

        if (testType) {
            query = query.eq("test_type", testType);
        }

        if (locked === "locked") {
            query = query.eq("is_locked", true);
        }

        if (locked === "unlocked") {
            query = query.eq("is_locked", false);
        }

        /* ---------- Execute ---------- */
        const {
            data,
            error,
            count,
        } = await query
            .order("created_at", { ascending: false })
            .range(from, to)
            .overrideTypes<
                TestQueryRow[],
                { merge: false }
            >();

        if (error) {
            throw new Error(error.message);
        }

        // NEW: Map over the data to extract unique subjects and format it for the frontend
        const items = (data ?? []).map((row) => {
            const { test_sections, ...rest } = row;

            const uniqueSubjects = Array.from(
                new Set((test_sections ?? []).map((sec) => sec.subject_label).filter(Boolean))
            );

            return {
                ...rest,
                subject_labels: uniqueSubjects,
            } as unknown as TestRow; // Casting to TestRow assuming you updated it
        });

        return NextResponse.json({
            items,
            page,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / pageSize),
            pageSize,
            currentUserId: auth.user.userId,
            isAdmin: auth.user.role === "admin",
        });
    } catch (error) {
        console.error("[ADMIN_TESTS_ERROR]", error);

        return NextResponse.json(
            { message: "Failed to load tests" },
            { status: 500 }
        );
    }
}
