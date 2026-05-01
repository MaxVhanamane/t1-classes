"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { revalidatePath, updateTag } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function deletePdf(
    courseId: string,
    topicId: string,
    pdfId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();

        /**
         * 2. Fetch PDF unit
         */
        const { data: pdf, error: pdfError } = await supabase
            .from("course_units")
            .select("id, course_id, unit_type, file_path")
            .eq("id", pdfId)
            .single();

        if (pdfError || !pdf) {
            return { error: "PDF not found" };
        }

        if (pdf.unit_type !== "pdf") {
            return { error: "Invalid unit type" };
        }

        /**
         * 3. Ownership check
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", pdf.course_id)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return { error: "You are not allowed to delete this PDF" };
        }

        /**
         * 4. Delete DB row
         * (triggers reorder_course_units_after_delete)
         */
        const { error: deleteError } = await supabase
            .from("course_units")
            .delete()
            .eq("id", pdfId);

        if (deleteError) {
            console.error("[DELETE_PDF_DB_ERROR]", deleteError);
            return { error: "Failed to delete PDF. Please try again." };
        }

        /**
         * 5. Cleanup R2 object (best effort)
         */
        if (pdf.file_path) {
            await deleteR2Object(
                R2_PRIVATE_BUCKET_NAME,
                pdf.file_path
            );
        }

        /**
         * 6. Revalidate UI
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[DELETE_PDF_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
