"use server";

import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    PracticeSetInput,
    practiceSetSchema,
} from "../../../../zod-schema/practice-set/practice-set";
import { revalidatePath } from "next/cache";

export async function createPracticeSet(
    courseId: string,
    topicId: string,
    rawData: PracticeSetInput
) {
    /**
     * 1. Validate input
     */
    const parsed = practiceSetSchema.safeParse(rawData);

    if (!parsed.success) {
        throw new Error("Invalid practice set data");
    }

    const { title, description, isFreePreview } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

    /**
     * 2. Fetch topic
     */
    const { data: topic, error: topicError } = await supabase
        .from("course_structure")
        .select("id, course_id")
        .eq("id", topicId)
        .single();

    if (topicError || !topic) {
        throw new Error("Topic not found");
    }

    if (topic.course_id !== courseId) {
        throw new Error("Topic does not belong to this course");
    }

    /**
     * 3. Ownership check
     */
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", topic.course_id)
        .single();

    if (!course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("Not allowed");
    }

    /**
     * 4. Compute next sort_order
     */
    const { data: lastSet } = await supabase
        .from("practice_sets")
        .select("sort_order")
        .eq("topic_id", topicId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastSet?.sort_order ?? 0) + 1;

    /**
     * 5. Insert practice set
     */
    const { error: insertError } = await supabase
        .from("practice_sets")
        .insert({
            topic_id: topicId,
            title,
            description: description || null,


            is_free_preview: isFreePreview,

            is_published: false,
            sort_order: nextSortOrder,
        });

    if (insertError) {
        throw new Error(insertError.message);
    }

    /**
     * 6. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
