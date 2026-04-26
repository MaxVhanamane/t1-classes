"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    AddTopicFormInput,
    addTopicFormSchema,
} from "../../zod-schema/topic.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createTopic(
    courseId: string,
    chapterId: string,
    rawData: AddTopicFormInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        // 1. Validate input
        const parsed = addTopicFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid topic data" };
        }

        const { title } = parsed.data;

        const supabase = await createServerSupabaseClient();


        // 2. Fetch chapter
        const { data: chapter, error: chapterError } = await supabase
            .from("course_structure")
            .select("id, course_id, structure_type")
            .eq("id", chapterId)
            .single();

        if (chapterError || !chapter) {
            return { error: "Chapter not found" };
        }

        if (chapter.structure_type !== "chapter") {
            return { error: "Invalid chapter" };
        }

        if (chapter.course_id !== courseId) {
            return { error: "Chapter does not belong to this course" };
        }

        // 3. Fetch course owner
        const { data: courseRow, error: courseError } = await supabase
            .from("courses")
            .select("created_by")
            .eq("id", chapter.course_id)
            .single();

        if (courseError || !courseRow) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isOwner = courseRow.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return {
                error: "You are not allowed to add topics to this course",
            };
        }

        // 4. Compute next sort_order
        const { data: lastTopic, error: lastTopicError } = await supabase
            .from("course_structure")
            .select("sort_order")
            .eq("parent_id", chapterId)
            .eq("structure_type", "topic")
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastTopicError) {
            console.error("[CREATE_TOPIC_FETCH_LAST_ERROR]", lastTopicError);
            return { error: "Failed to determine topic order" };
        }

        const nextSortOrder = (lastTopic?.sort_order ?? 0) + 1;

        // 5. Insert topic
        const { error: insertError } = await supabase
            .from("course_structure")
            .insert({
                course_id: courseId,
                parent_id: chapterId,
                title,
                structure_type: "topic",
                sort_order: nextSortOrder,
                is_published: false,
            });

        if (insertError) {
            console.error("[CREATE_TOPIC_INSERT_ERROR]", insertError);
            return { error: "Failed to add topic. Please try again." };
        }

        // 6. Revalidate
        revalidatePath(`/admin/curriculum/${courseId}`);
    } catch (error) {
        console.error("[CREATE_TOPIC_ERROR]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
