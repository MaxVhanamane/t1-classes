"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import {
    renameTopicFormSchema,
    RenameTopicFormInput,
} from "../../zod-schema/rename-topic.schema";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function renameTopic(
    courseId: string,
    topicId: string,
    rawData: RenameTopicFormInput
) {
    // 1. Validate input
    const parsed = renameTopicFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid topic title");
    }

    const { title } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getAuthIfHasRole(["admin", "teacher"]); // admin OR teacher
    if (!staff) {
        redirect("/login");
    }

    /**
     * 2. Fetch topic
     */
    const { data: topic, error: topicError } = await supabase
        .from("course_structure")
        .select("id, course_id, structure_type")
        .eq("id", topicId)
        .single();

    if (topicError || !topic) {
        throw new Error("Topic not found");
    }

    if (topic.structure_type !== "topic") {
        throw new Error("Invalid topic");
    }

    if (topic.course_id !== courseId) {
        throw new Error("Topic does not belong to this course");
    }

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
    const isOwner = course.created_by === staff.userId;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to rename this topic");
    }

    /**
     * 4. Update title
     */
    const { error: updateError } = await supabase
        .from("course_structure")
        .update({ title })
        .eq("id", topicId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    /**
     * 5. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}`);
}
