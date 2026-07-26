import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import type { SyllabusSectionRow } from "@/src/app/admin/syllabus-progress/_features/types/syllabus-progress.types";

export async function GET(request: Request) {
    await connection();

    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Client & Params ---------- */
        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);
        const batchId = searchParams.get("batchId");

        if (!batchId) {
            return NextResponse.json(
                { message: "batchId is required" },
                { status: 400 }
            );
        }

        /* ---------- Security Check ---------- */
        // If user is a teacher, verify they belong to this batch
        if (auth.user.role !== "admin") {
            const { data: assignment, error: assignmentError } = await supabase
                .from("batch_instructors")
                .select("batch_id")
                .eq("batch_id", batchId)
                .eq("instructor_id", auth.user.userId)
                .single();

            if (assignmentError || !assignment) {
                return NextResponse.json(
                    { message: "Forbidden: You are not assigned to this batch" },
                    { status: 403 }
                );
            }
        }

        /* ---------- Query Batch Metadata ---------- */
        const { data: batchData, error: batchError } = await supabase
            .from("batches")
            .select("start_date, end_date")
            .eq("id", batchId)
            .single();

        if (batchError) {
            throw new Error("Failed to fetch batch metadata: " + batchError.message);
        }

        /* ---------- Query Sections & Chapters ---------- */
        const { data, error } = await supabase
            .from("batch_progress_sections")
            .select(`
                id,
                batch_id,
                title,
                sort_order,
                chapters:batch_progress_chapters (
                  id,
                  batch_id,
                  section_id,
                  title,
                  sort_order,
                  source_chapter_id,
                  status,
                  started_at,
                  completed_at,
                  verified_at,
                  updated_at,
                  updated_by:users!fk_bpc_updater (
                    id,
                    full_name
                  ),
                  verified_by:users!fk_bpc_verifier (
                    id,
                    full_name
                  )
                )
            `)
            .eq("batch_id", batchId)
            .order("sort_order", { ascending: true })
            .order("sort_order", { referencedTable: "batch_progress_chapters", ascending: true })
            .overrideTypes<SyllabusSectionRow[], { merge: false }>();

        if (error) {
            throw new Error(error.message);
        }

        const items: SyllabusSectionRow[] = data ?? [];

        return NextResponse.json({
            items,
            batch: batchData,
            currentUserId: auth.user.userId,
            isAdmin: auth.user.role === "admin",
        });

    } catch (error) {
        console.error("[SYLLABUS_PROGRESS_GET_ERROR]", error);

        return NextResponse.json(
            { message: "Failed to load syllabus progress" },
            { status: 500 }
        );
    }
}
