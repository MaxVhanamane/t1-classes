"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { EditPdfFormInput, editPdfFormSchema } from "../../../zod-schema/pdf.schema";


export async function updatePdfUnit(
    courseId: string,
    topicId: string,
    pdfId: string,
    payload: {
        form: EditPdfFormInput;
        newFilePath?: string;
    }
) {
    /**
     * 1. Validate input (EDIT schema)
     */
    const parsed = editPdfFormSchema.safeParse(payload.form);
    if (!parsed.success) {
        throw new Error("Invalid PDF data");
    }

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

    /**
     * 2. Fetch existing PDF (strict)
     */
    const { data: pdf, error: pdfError } = await supabase
        .from("course_units")
        .select("id, course_id, structure_id, unit_type, file_path")
        .eq("id", pdfId)
        .single();

    if (pdfError || !pdf) {
        throw new Error("PDF not found");
    }

    if (pdf.unit_type !== "pdf") {
        throw new Error("Invalid unit type");
    }

    if (pdf.course_id !== courseId || pdf.structure_id !== topicId) {
        throw new Error("Unauthorized");
    }

    /**
     * 3. Ownership check
     */
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", pdf.course_id)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to edit this PDF");
    }

    const oldFilePath = pdf.file_path;
    const newFilePath = payload.newFilePath;

    /**
     * 4. Update DB
     */
    const { error: updateError } = await supabase
        .from("course_units")
        .update({
            title: parsed.data.title,
            description: parsed.data.description ?? null,
            duration_minutes: parsed.data.durationMinutes
                ? Number(parsed.data.durationMinutes)
                : null,
            is_free_preview: parsed.data.isFreePreview,
            file_path: newFilePath ?? oldFilePath,
            updated_at: new Date().toISOString(),
        })
        .eq("id", pdfId);

    if (updateError) {
        // rollback newly uploaded file if DB write fails
        if (newFilePath) {
            await supabase.storage.from("course-pdfs").remove([newFilePath]);
        }
        throw new Error(updateError.message);
    }

    /**
     * 5. Cleanup old file (best-effort)
     */
    if (newFilePath && oldFilePath && newFilePath !== oldFilePath) {
        await supabase.storage.from("course-pdfs").remove([oldFilePath]);
    }

    /**
     * 6. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
