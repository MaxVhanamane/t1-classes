"use server";

import { updateTag } from "next/cache";
import { batchSchema, Category } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function updateBatch(
    batchId: string,
    previousCategory: Category,
    input: unknown,
    slug: string
): Promise<ServerActionResponse<string>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireAdminServerOnly();
    try {
        /* -------------------------------------------------- */
        /* 1. Validate input                                  */
        /* -------------------------------------------------- */
        const parsed = batchSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid batch data",
            };
        }

        const data = parsed.data;

        const subjects =
            data.subjects?.map((s) => s.value) ?? null;

        const learningOutcomes =
            data.learning_outcomes?.map((o) => o.value) ?? null;

        const targetAudience =
            data.target_audience?.map((a) => a.value) ?? null;

        /* -------------------------------------------------- */
        /* 3. Call RPC                                        */
        /* -------------------------------------------------- */
        const supabase = await createServerSupabaseClient();

        const { error: rpcError } = await supabase.rpc(
            "update_batch_with_courses",
            {
                /* ---------- Identity ---------- */
                p_batch_id: batchId,

                /* ---------- Basic ---------- */
                p_title: data.title,
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

        if (rpcError) {
            console.error("[UPDATE_BATCH_RPC_ERROR]", rpcError);
            return {
                error: "Failed to update batch. Please try again.",
            };
        }

        /* ---------- sync instructors ---------- */
        const { data: existing, error: existingError } =
            await supabase
                .from("batch_instructors")
                .select("instructor_id")
                .eq("batch_id", batchId);

        if (existingError) {
            console.error(
                "[UPDATE_BATCH_FETCH_INSTRUCTORS_ERROR]",
                existingError
            );
            return {
                error:
                    "Batch updated, but failed to sync instructors.",
            };
        }

        const existingIds =
            existing?.map((i) => i.instructor_id) ?? [];

        const newIds = data.instructor_ids ?? [];

        const toInsert = newIds.filter(
            (id) => !existingIds.includes(id)
        );

        const toDelete = existingIds.filter(
            (id) => !newIds.includes(id)
        );

        if (toInsert.length) {
            const { error: insertError } = await supabase
                .from("batch_instructors")
                .insert(
                    toInsert.map((id) => ({
                        batch_id: batchId,
                        instructor_id: id,
                    }))
                );

            if (insertError) {
                console.error(
                    "[UPDATE_BATCH_INSERT_INSTRUCTORS_ERROR]",
                    insertError
                );
                return {
                    error:
                        "Batch updated, but assigning instructors failed.",
                };
            }
        }

        if (toDelete.length) {
            const { error: deleteError } = await supabase
                .from("batch_instructors")
                .delete()
                .eq("batch_id", batchId)
                .in("instructor_id", toDelete);

            if (deleteError) {
                console.error(
                    "[UPDATE_BATCH_DELETE_INSTRUCTORS_ERROR]",
                    deleteError
                );
                return {
                    error:
                        "Batch updated, but removing instructors failed.",
                };
            }
        }

        /* -------------------------------------------------- */
        /* 4. Revalidate                                      */
        /* -------------------------------------------------- */

        updateTag(`batch-detail-${slug}`);
        updateTag(`batch-list-${data.category}`);

        if (
            previousCategory &&
            previousCategory !== data.category
        ) {
            updateTag(`batch-list-${previousCategory}`);
        }

        return { data: batchId };
    } catch (error) {
        console.error("[UPDATE_BATCH_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
