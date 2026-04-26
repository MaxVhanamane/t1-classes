"use server";

import { revalidatePath, updateTag } from "next/cache";
import { batchSchema } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { generateBatchSlug } from "@/src/lib/helper-functions/generate-slug";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createBatch(
    input: unknown
): Promise<ServerActionResponse<string>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireAdminServerOnly();

    try {
        /* ---------------- Validate ---------------- */
        const parsed = batchSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ?? "Invalid batch data",
            };
        }

        const data = parsed.data;



        if (staff.role !== "admin") {
            return { error: "Only admins can create batches" };
        }

        /* ---------------- Transform arrays ---------------- */
        const subjects =
            data.subjects?.map((s) => s.value) ?? null;

        const learningOutcomes =
            data.learning_outcomes?.map((o) => o.value) ?? null;

        const targetAudience =
            data.target_audience?.map((a) => a.value) ?? null;

        /* ---------------- Slug ---------------- */
        const slug = generateBatchSlug(data.title);

        /* ---------------- RPC ---------------- */
        const supabase = await createServerSupabaseClient();

        const { data: batchId, error } = await supabase.rpc(
            "create_batch_with_courses",
            {
                /* ---------- Basic ---------- */
                p_title: data.title,
                p_slug: slug,
                p_subtitle: data.subtitle ?? null,
                p_description: data.description ?? null,

                /* ---------- Category ---------- */
                p_category: data.category,
                p_board: data.board ?? null,

                /* ---------- Academic ---------- */
                p_subjects: subjects,
                p_class_level: data.class_level ?? null,
                p_target_exam: data.target_exam ?? null,

                /* ---------- Pricing ---------- */
                p_sale_price: data.sale_price,
                p_list_price: data.list_price,

                /* ---------- Media ---------- */
                p_thumbnail_image: data.thumbnail_image ?? null,

                /* ---------- Marketing ---------- */
                p_learning_outcomes: learningOutcomes,
                p_target_audience: targetAudience,

                /* ---------- Delivery ---------- */
                p_mode: data.mode,
                p_is_active: data.is_active,
                p_is_admission_open: data.is_admission_open,
                p_languages: data.languages,

                /* ---------- Location ---------- */
                p_location: data.location ?? null,
                p_address: data.address ?? null,

                /* ---------- Lifecycle ---------- */
                p_start_date: data.start_date,
                p_end_date: data.end_date,

                /* ---------- Capacity ---------- */
                p_capacity: data.capacity ?? null,

                /* ---------- Relations ---------- */
                p_course_ids: data.course_ids,
            }
        );

        if (error) {
            console.error("[CREATE_BATCH_RPC_ERROR]", error);
            return { error: "Failed to create batch. Please try again." };
        }

        if (!batchId) {
            return { error: "Failed to create batch" };
        }

        /* ---------- Sync instructors ---------- */
        if (data.instructor_ids?.length) {
            const { error: instructorError } = await supabase
                .from("batch_instructors")
                .insert(
                    data.instructor_ids.map((id) => ({
                        batch_id: batchId,
                        instructor_id: id,
                    }))
                );

            if (instructorError) {
                console.error(
                    "[CREATE_BATCH_INSTRUCTORS_ERROR]",
                    instructorError
                );
                return {
                    error:
                        "Batch created, but assigning instructors failed.",
                };
            }
        }

        /* ---------------- Revalidate ---------------- */
        revalidatePath("/admin/batches");
        updateTag(`batch-list-${data.category}`);

        return { data: batchId };
    } catch (error) {
        console.error("[CREATE_BATCH_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
