"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { AddPdfFormInput, addPdfFormSchema } from "../../../zod-schema/pdf.schema";



export async function createPdf(
    courseId: string,
    topicId: string,
    filePath: string,
    rawData: AddPdfFormInput
) {
    /**
     * 1. Validate input
     */
    const parsed = addPdfFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid PDF data");
    }

    const { title, description, durationMinutes, isFreePreview } = parsed.data;

    /**
     * 2. Auth
     */
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    /**
     * 3. Fetch course owner
     */
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to add PDFs to this course");
    }

    /**
     * 4. Compute next sort_order (starts at 1)
     */
    const { data: lastUnit } = await supabase
        .from("course_units")
        .select("sort_order")
        .eq("structure_id", topicId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastUnit?.sort_order ?? 0) + 1;

    /**
     * 5. Insert PDF unit
     */
    const { error: insertError } = await supabase.from("course_units").insert({
        course_id: courseId,
        structure_id: topicId,
        title,
        description: description || null,
        unit_type: "pdf",
        file_path: filePath,
        content_url: null,
        duration_minutes: durationMinutes
            ? Number(durationMinutes)
            : null,
        is_free_preview: isFreePreview,
        sort_order: nextSortOrder,
        is_published: false,
        video_provider: null,
    });

    if (insertError) {
        throw new Error(insertError.message);
    }

    /**
     * 6. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
