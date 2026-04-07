"use server";

import { revalidatePath } from "next/cache";
import { batchSchema, Category } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function updateBatch(
    batchId: string,
    previousCategory: Category,
    input: unknown
) {
    /* -------------------------------------------------- */
    /* 1. Validate input                                  */
    /* -------------------------------------------------- */
    const parsed = batchSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ?? "Invalid batch data"
        );
    }

    const data = parsed.data;

    const subjects =
        data.subjects?.map((s) => s.value) ?? null;

    const learningOutcomes =
        data.learning_outcomes?.map((o) => o.value) ?? null;

    const targetAudience =
        data.target_audience?.map((a) => a.value) ?? null;

    /* -------------------------------------------------- */
    /* 2. Auth guard                                      */
    /* -------------------------------------------------- */
    const staff = await getCurrentStaff();

    if (staff.role !== "admin") {
        throw new Error("Only admins can update batches");
    }

    /* -------------------------------------------------- */
    /* 3. Call RPC                                        */
    /* -------------------------------------------------- */
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc(
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

    if (error) {
        throw new Error(error.message);
    }

    /* ---------- sync instructors ---------- */
    const { data: existing } = await supabase
        .from("batch_instructors")
        .select("instructor_id")
        .eq("batch_id", batchId);

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
        await supabase.from("batch_instructors").insert(
            toInsert.map((id) => ({
                batch_id: batchId,
                instructor_id: id,
            }))
        );
    }

    if (toDelete.length) {
        await supabase
            .from("batch_instructors")
            .delete()
            .eq("batch_id", batchId)
            .in("instructor_id", toDelete);
    }

    /* -------------------------------------------------- */
    /* 4. Revalidate                                      */
    /* -------------------------------------------------- */
    revalidatePath("/admin/batches");
    revalidatePath(`/explore/${data.category}/batches`, "layout");

    if (previousCategory && previousCategory !== data.category) {
        revalidatePath(`/explore/${previousCategory}/batches`, "layout");
    }
}
