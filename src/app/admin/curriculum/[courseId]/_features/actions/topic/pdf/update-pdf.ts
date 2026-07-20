"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import {
    EditPdfFormInput,
    editPdfFormSchema,
} from "../../../zod-schema/pdf.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function updatePdfUnit(
    courseId: string,
    topicId: string,
    pdfId: string,
    payload: {
        form: EditPdfFormInput;
        newFilePath?: string;
    }
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = editPdfFormSchema.safeParse(payload.form);
        if (!parsed.success) {
            return { error: "Invalid PDF data" };
        }

        const supabase = await createServerSupabaseClient();



        /**
         * 3. Fetch existing PDF
         */
        const { data: pdf, error: pdfError } = await supabase
            .from("course_units")
            .select("id, course_id, structure_id, unit_type, file_path")
            .eq("id", pdfId)
            .single();

        if (pdfError || !pdf) {
            return { error: "PDF not found" };
        }

        if (pdf.unit_type !== "pdf") {
            return { error: "Invalid unit type" };
        }

        if (pdf.course_id !== courseId || pdf.structure_id !== topicId) {
            return { error: "Unauthorized" };
        }

        /**
         * 4. Ownership check
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
            return { error: "You are not allowed to edit this PDF" };
        }

        const oldFilePath = pdf.file_path;
        const newFilePath = payload.newFilePath;

        /**
         * 5. Update DB
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

        /**
         * If DB update fails → rollback uploaded file
         */
        if (updateError) {
            if (newFilePath) {
                try {
                    await deleteR2Object(
                        R2_PRIVATE_BUCKET_NAME,
                        newFilePath
                    );
                } catch (err) {
                    console.error("[R2_ROLLBACK_FAILED]", err);
                }
            }

            console.error("[UPDATE_PDF_DB_ERROR]", updateError);
            return { error: "Failed to update PDF. Please try again." };
        }

        /**
         * 6. Delete old file (ONLY if replaced)
         */
        if (newFilePath && oldFilePath && newFilePath !== oldFilePath) {
            try {
                await deleteR2Object(
                    R2_PRIVATE_BUCKET_NAME,
                    oldFilePath
                );
            } catch (err) {
                console.error("[R2_OLD_FILE_DELETE_FAILED]", err);
            }
        }

        /**
         * 7. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[UPDATE_PDF_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
