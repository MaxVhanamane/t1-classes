"use server";

import { revalidatePath, updateTag } from "next/cache";
import { batchSchema } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { generateBatchSlug } from "@/src/lib/helper-functions/generate-slug";

export async function createBatch(
    input: unknown
): Promise<string> {
    /* ---------------- Validate ---------------- */
    const parsed = batchSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ?? "Invalid batch data"
        );
    }

    const data = parsed.data;

    /* ---------------- Auth ---------------- */
    const staff = await getCurrentStaff();

    if (staff.role !== "admin") {
        throw new Error("Only admins can create batches");
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
        throw new Error(error.message);
    }

    if (!batchId) {
        throw new Error("Failed to create batch");
    }

    /* ---------- sync instructors ---------- */
    if (data.instructor_ids?.length) {
        await supabase.from("batch_instructors").insert(
            data.instructor_ids.map((id) => ({
                batch_id: batchId,
                instructor_id: id,
            }))
        );
    }

    /* ---------------- Revalidate ---------------- */
    revalidatePath("/admin/batches");
    updateTag(`batch-list-${data.category}`);
    return batchId;
}
