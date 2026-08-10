import { connection, NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import type { LeadRow } from "@/src/app/admin/leads/_features/types/lead.types";

const PAGE_SIZE = 20;

type LeadListResponse = {
    items: LeadRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

type LeadQueryRow = Omit<LeadRow, "course" | "batch" | "updated_by_user"> & {
    course: { id: string; title: string } | { id: string; title: string }[] | null;
    batch: { id: string; title: string } | { id: string; title: string }[] | null;
    updated_by_user: { id: string; full_name: string } | { id: string; full_name: string }[] | null;
};

export async function GET(request: NextRequest) {
    await connection();
    try {
        const auth = await requireStaffApiRoute();
        if (!auth.authorized) return auth.response;

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") ?? "";
        const status = searchParams.get("status") ?? "all";
        const targetType = searchParams.get("targetType") ?? "all"; // <-- Get target parameter
        const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const supabase = await createServerSupabaseClient();

        let countQuery = supabase
            .from("enrollment_leads")
            .select("*", { count: "exact", head: true });

        let dataQuery = supabase
            .from("enrollment_leads")
            .select(`
                id, name, phone, email, message, status, source, 
                created_at, updated_at, next_follow_up_at, lost_reason,
                course:courses(id, title),
                batch:batches(id, title), 
                updated_by_user:users!enrollment_leads_updated_by_fkey(id, full_name)
            `);

        // Search Filter 
        if (search.trim()) {
            const searchTerm = search.trim();
            const searchFilter = `name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`;
            countQuery = countQuery.or(searchFilter);
            dataQuery = dataQuery.or(searchFilter);
        }

        // Status Filter
        if (status !== "all") {
            countQuery = countQuery.eq("status", status);
            dataQuery = dataQuery.eq("status", status);
        }

        // Target Type Filter (Batch vs Course)
        if (targetType === "course") {
            countQuery = countQuery.not("course_id", "is", null);
            dataQuery = dataQuery.not("course_id", "is", null);
        } else if (targetType === "batch") {
            countQuery = countQuery.not("batch_id", "is", null);
            dataQuery = dataQuery.not("batch_id", "is", null);
        }

        const [countResult, dataResult] = await Promise.all([
            countQuery,
            dataQuery
                .order("created_at", { ascending: false })
                .range(from, to),
        ]);

        if (countResult.error) throw new Error(countResult.error.message);
        if (dataResult.error) throw new Error(dataResult.error.message);

        const total = countResult.count ?? 0;

        const rows = dataResult.data as unknown as LeadQueryRow[];

        const items: LeadRow[] = rows.map((row) => {
            const courseObj = Array.isArray(row.course) ? row.course[0] : row.course;
            const batchObj = Array.isArray(row.batch) ? row.batch[0] : row.batch;
            const userObj = Array.isArray(row.updated_by_user) ? row.updated_by_user[0] : row.updated_by_user;

            return {
                ...row,
                course: courseObj,
                batch: batchObj ? { id: batchObj.id, name: batchObj.title } : null,
                updated_by_user: userObj,
            };
        });

        const response: LeadListResponse = {
            items,
            total,
            page,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(total / PAGE_SIZE),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("[ADMIN_LEADS_GET_ERROR]", error);
        return NextResponse.json({ message: "Failed to load leads" }, { status: 500 });
    }
}
