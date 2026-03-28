"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { revalidatePath } from "next/cache";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { ROLE_GROUPS } from "@/src/lib/auth/role-groups";
import { redirect } from "next/navigation";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function deletePdf(
    courseId: string,
    topicId: string,
    pdfId: string
) {
    const supabase = await createServerSupabaseClient();
    const staff = await getAuthIfHasRole(ROLE_GROUPS.STAFF); // admin OR teacher

    if (!staff) {
        redirect("/login")
    }

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
    const isOwner = course?.created_by === staff.userId;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to delete this PDF");
    }

    /**
     * 3. Delete DB row
     * (triggers reorder_course_units_after_delete)
     */
    const { error: deleteError } = await supabase
        .from("course_units")
        .delete()
        .eq("id", pdfId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 4. Cleanup R2 object (best effort)
     */
    if (pdf.file_path) {
        try {
            await deleteR2Object(
                R2_PRIVATE_BUCKET_NAME,
                pdf.file_path
            );
        } catch (err) {
            console.error("[R2_PDF_DELETE_FAILED]", err);
            // Do not throw → DB already updated
        }
    }

    /**
     * 5. Revalidate UI
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
