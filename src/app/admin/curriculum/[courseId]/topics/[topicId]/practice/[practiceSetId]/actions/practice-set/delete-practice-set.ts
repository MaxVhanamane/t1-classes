"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    DeletePracticeSetInput,
    deletePracticeSetSchema,
} from "../../../../zod-schema/practice-set/practice-set";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deletePracticeSet(
    rawData: DeletePracticeSetInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate
         */
        const parsed = deletePracticeSetSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid delete request" };
        }

        const { courseId, topicId, practiceSetId } = parsed.data;

        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch practice set
         */
        const { data: practiceSet, error: psError } = await supabase
            .from("practice_sets")
            .select("id, topic_id")
            .eq("id", practiceSetId)
            .single();

        if (psError || !practiceSet) {
            return { error: "Practice set not found" };
        }

        if (practiceSet.topic_id !== topicId) {
            return {
                error: "Practice set does not belong to this topic",
            };
        }

        /**
         * 3. Fetch topic → course
         */
        const { data: topic, error: topicError } = await supabase
            .from("course_structure")
            .select("course_id")
            .eq("id", topicId)
            .single();

        if (topicError || !topic) {
            return { error: "Topic not found" };
        }

        if (topic.course_id !== courseId) {
            return {
                error: "Topic does not belong to this course",
            };
        }

        /**
         * 4. Ownership check
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return { error: "Not allowed" };
        }

        /**
         * 5. Delete practice set
         * (questions + options cascade automatically)
         */
        const { error: deleteError } = await supabase
            .from("practice_sets")
            .delete()
            .eq("id", practiceSetId);

        if (deleteError) {
            console.error(
                "[DELETE_PRACTICE_SET_ERROR]",
                deleteError
            );
            return {
                error:
                    "Failed to delete practice set. Please try again.",
            };
        }

        /**
         * 6. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
        updateTag(`course-outline:enrolled:${course.slug}`);

        // No return on success
    } catch (error) {
        console.error(
            "[DELETE_PRACTICE_SET_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
