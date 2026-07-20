"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    renameTopicFormSchema,
    RenameTopicFormInput,
} from "../../zod-schema/rename-topic.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function renameTopic(
    courseId: string,
    topicId: string,
    rawData: RenameTopicFormInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        // 1. Validate input
        const parsed = renameTopicFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid topic title" };
        }

        const { title } = parsed.data;

        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch topic
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
         * 3. Fetch course owner
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
            return { error: "You are not allowed to rename this topic" };
        }

        /**
         * 4. Update title
         */
        const { error: updateError } = await supabase
            .from("course_structure")
            .update({ title })
            .eq("id", topicId);

        if (updateError) {
            console.error("[RENAME_TOPIC_ERROR]", updateError);
            return { error: "Failed to rename topic. Please try again." };
        }

        /**
         * 5. Revalidate
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[RENAME_TOPIC_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
