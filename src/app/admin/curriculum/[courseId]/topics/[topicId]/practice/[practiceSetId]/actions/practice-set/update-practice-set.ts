"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    UpdatePracticeSetInput,
    updatePracticeSetSchema,
} from "../../../../zod-schema/practice-set/practice-set";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function updatePracticeSet(
    rawData: UpdatePracticeSetInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = updatePracticeSetSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid practice set data" };
        }

        const {
            courseId,
            topicId,
            practiceSetId,
            title,
            description,
            isFreePreview,
        } = parsed.data;

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
            .select("created_by")
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
         * 5. Update practice set
         */
        const { error: updateError } = await supabase
            .from("practice_sets")
            .update({
                title: title.trim(),
                description: description?.trim() || null,
                is_free_preview: isFreePreview,
            })
            .eq("id", practiceSetId);

        if (updateError) {
            console.error(
                "[UPDATE_PRACTICE_SET_ERROR]",
                updateError
            );
            return {
                error: "Failed to update practice set. Please try again.",
            };
        }

        /**
         * 6. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );

        // No return needed on success
    } catch (error) {
        console.error(
            "[UPDATE_PRACTICE_SET_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
