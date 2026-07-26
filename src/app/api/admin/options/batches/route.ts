import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export type BatchSelectItem = {
    id: string;
    title: string;
    is_active: boolean;
};

type TeacherBatchRow = {
    batch: BatchSelectItem | null;
};

export async function GET(request: Request) {
    await connection();

    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const supabase = await createServerSupabaseClient();

        /* ---------- Params ---------- */
        const { searchParams } = new URL(request.url);
        // Default to false if not provided, preserving legacy behavior
        const includeInactive = searchParams.get("includeInactive") === "true";

        /* ---------- Admin ---------- */
        if (auth.user.role === "admin") {
            let query = supabase
                .from("batches")
                .select(`
                    id,
                    title,
                    is_active
                `);

            if (!includeInactive) {
                query = query.eq("is_active", true);
            }

            const { data, error } = await query
                .order("title")
                .overrideTypes<
                    BatchSelectItem[],
                    {
                        merge: false;
                    }
                >();

            if (error) {
                throw new Error(error.message);
            }

            return NextResponse.json(data ?? []);
        }

        /* ---------- Teacher ---------- */
        let teacherQuery = supabase
            .from("batch_instructors")
            .select(`
                batch:batches!inner (
                    id,
                    title,
                    is_active
                )
            `)
            .eq("instructor_id", auth.user.userId);

        if (!includeInactive) {
            teacherQuery = teacherQuery.eq("batch.is_active", true);
        }

        const { data, error } = await teacherQuery
            .order("title", {
                referencedTable: "batch",
            })
            .overrideTypes<
                TeacherBatchRow[],
                {
                    merge: false;
                }
            >();

        if (error) {
            throw new Error(error.message);
        }

        const batches: BatchSelectItem[] = (data ?? []).flatMap((row) =>
            row.batch ? [row.batch] : []
        );

        return NextResponse.json(batches);
    } catch (error) {
        console.error("[ADMIN_BATCH_OPTIONS_ERROR]", error);

        return NextResponse.json(
            {
                message: "Failed to load batches",
            },
            {
                status: 500,
            }
        );
    }
}
