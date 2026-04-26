"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function deleteTopic(
    courseId: string,
    topicId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();

        /**
         * 1. Fetch topic
         */
        const { data: topic, error: topicError } = await supabase
            .from("course_structure")
            .select("id, course_id, structure_type")
            .eq("id", topicId)
            .single();

        if (topicError || !topic) {
            return { error: "Topic not found" };
        }

        if (topic.structure_type !== "topic") {
            return { error: "Invalid topic" };
        }

        if (topic.course_id !== courseId) {
            return { error: "Topic does not belong to this course" };
        }

        /**
         * 2. Fetch course owner
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", topic.course_id)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        /**
         * 3. Authorization
         */
        const isAdmin = staff.role === "admin";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return { error: "You are not allowed to delete this topic" };
        }

        /**
         * 4. Fetch all PDF file paths BEFORE deletion
         */
        const { data: pdfUnits, error: pdfError } = await supabase
            .from("course_units")
            .select("file_path")
            .eq("structure_id", topicId)
            .eq("unit_type", "pdf")
            .not("file_path", "is", null);

        console.log("pdf units", pdfUnits)

        if (pdfError) {
            console.error("[FETCH_TOPIC_PDFS_ERROR]", pdfError);
            return { error: "Failed to fetch topic PDFs." };
        }

        const filePaths =
            pdfUnits
                ?.map((pdf) => pdf.file_path)
                .filter(Boolean) || [];

        /**
         * 5. Delete topic (CASCADE deletes units)
         */
        const { error: deleteError } = await supabase
            .from("course_structure")
            .delete()
            .eq("id", topicId);

        if (deleteError) {
            console.error("[DELETE_TOPIC_ERROR]", deleteError);
            return { error: "Failed to delete topic. Please try again." };
        }

        /**
         * 6. Cleanup R2 objects AFTER successful DB deletion
         *    (Best effort — does not affect DB integrity)
         */
        if (filePaths.length > 0) {
            await Promise.allSettled(
                filePaths.map((path) =>
                    deleteR2Object(R2_PRIVATE_BUCKET_NAME, path)
                )
            );
        }
        /**
         * 7. Revalidate UI
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);


    } catch (error) {
        console.error("[DELETE_TOPIC_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
