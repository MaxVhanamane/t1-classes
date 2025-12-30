"use server";

import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function deletePdf(
    courseId: string,
    topicId: string,
    pdfId: string
) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    /**
     * 1. Fetch PDF unit
     */
    const { data: pdf, error: pdfError } = await supabase
        .from("course_units")
        .select("id, course_id, unit_type, file_path")
        .eq("id", pdfId)
        .single();

    if (pdfError || !pdf) {
        throw new Error("PDF not found");
    }

    if (pdf.unit_type !== "pdf") {
        throw new Error("Invalid unit type");
    }

    /**
     * 2. Ownership check
     */
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", pdf.course_id)
        .single();

    const isAdmin = staff.role === "admin";
    const isOwner = course?.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to delete this PDF");
    }

    /**
     * 3. Delete DB row
     * (this triggers reorder_course_units_after_delete)
     */
    const { error: deleteError } = await supabase
        .from("course_units")
        .delete()
        .eq("id", pdfId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 4. Cleanup storage (best effort)
     */
    if (pdf.file_path) {
        await supabase.storage
            .from("course-pdfs")
            .remove([pdf.file_path]);
    }

    /**
     * 5. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
