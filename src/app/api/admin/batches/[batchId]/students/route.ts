import { connection } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

const PAGE_SIZE = 50;

type EnrollmentWithUser = {
    id: string;
    user_id: string;
    roll_number: number | null;
    is_active: boolean;
    users: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
};

export async function GET(
    req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        await connection();

        const auth = await requireStaffApiRoute();
        if (!auth.authorized) {
            return auth.response;
        }

        const supabase = await createServerSupabaseClient();
        const { batchId } = await params;

        if (!batchId) {
            return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const search = (url.searchParams.get("search") || "").trim();

        let query = supabase
            .from("enrollments")
            .select(`
        id,
        user_id,
        roll_number,
        is_active,
        users!enrollments_user_id_fkey!inner (
          id,
          full_name,
          email
        )
      `, { count: "exact" })
            .eq("batch_id", batchId)
            .eq("target_type", "batch");

        // Search filter across the joined users table
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`, {
                referencedTable: "users"
            });
        }

        // Calculate pagination range
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await query
            .order("roll_number", { ascending: true, nullsFirst: false })
            .range(from, to);

        if (error) {
            console.error("[FETCH_BATCH_STUDENTS_ERROR]", error);
            return NextResponse.json(
                { error: "Failed to load students for this batch" },
                { status: 500 }
            );
        }

        const typedData = data as unknown as EnrollmentWithUser[];

        const formattedStudents = typedData.map((enrollment) => ({
            enrollmentId: enrollment.id,
            userId: enrollment.user_id,
            rollNumber: enrollment.roll_number,
            isActive: enrollment.is_active,
            user: {
                id: enrollment.users?.id || "",
                fullName: enrollment.users?.full_name || "Unknown User",
                email: enrollment.users?.email || "No email",
            },
        }));

        return NextResponse.json({
            items: formattedStudents,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / PAGE_SIZE),
            page,
            pageSize: PAGE_SIZE,
        });
    } catch (error) {
        console.error("[BATCH_STUDENTS_UNEXPECTED_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
