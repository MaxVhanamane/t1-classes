"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { AddTopicFormInput, addTopicFormSchema } from "../../zod-schema/topic.schema";


export async function createTopic(
    courseId: string,
    chapterId: string,
    rawData: AddTopicFormInput
) {

    // 1. Validate input
    const parsed = addTopicFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid topic data");
    }
    const { title } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    // 2. Fetch chapter (no nested selects)
    const { data: chapter, error: chapterError } = await supabase
        .from("course_structure")
        .select("id, course_id, structure_type")
        .eq("id", chapterId)
        .single();

    if (chapterError || !chapter) {
        throw new Error("Chapter not found");
    }

    if (chapter.structure_type !== "chapter") {
        throw new Error("Invalid chapter");
    }

    if (chapter.course_id !== courseId) {
        throw new Error("Chapter does not belong to this course");
    }

    // 3. Fetch course owner explicitly (single, reliable)
    const { data: courseRow, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", chapter.course_id)
        .single();

    if (courseError || !courseRow) {
        throw new Error("Course not found");
    }

    const courseOwnerId = courseRow.created_by;

    const isAdmin = staff.role === "admin";
    const isOwner = courseOwnerId === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to add topics to this course");
    }

    // 4. Compute next sort_order
    const { data: lastTopic } = await supabase
        .from("course_structure")
        .select("sort_order")
        .eq("parent_id", chapterId)
        .eq("structure_type", "topic")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastTopic?.sort_order ?? 0) + 1;

    // 5. Insert topic
    const { error: insertError } = await supabase.from("course_structure").insert({
        course_id: courseId,
        parent_id: chapterId,
        title,
        structure_type: "topic",
        sort_order: nextSortOrder,
        is_published: false,
    });

    if (insertError) {
        throw new Error(insertError.message);
    }

    // 6. Revalidate
    revalidatePath(`/admin/curriculum/${courseId}`);
}
