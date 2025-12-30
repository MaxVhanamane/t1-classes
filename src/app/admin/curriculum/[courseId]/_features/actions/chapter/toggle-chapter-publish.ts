"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import {
    toggleChapterPublishSchema,
    ToggleChapterPublishInput,
} from "../../zod-schema/chapter.schema";


export async function toggleChapterPublish(
    rawData: ToggleChapterPublishInput
) {
    /**
     * 1. Validate input
     */
    const parsed = toggleChapterPublishSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid publish data");
    }

    const { courseId, chapterId, publish } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

    /**
     * 2. Fetch chapter
     */
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

    /**
     * 3. Ownership check (admin OR course owner)
     */
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (!course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to update publish state");
    }

    /**
     * 4. Publish / Unpublish
     */
    if (publish) {
        /**
         * Publish ONLY the chapter
         */
        const { error } = await supabase
            .from("course_structure")
            .update({ is_published: true })
            .eq("id", chapterId);

        if (error) {
            throw new Error(error.message);
        }
    } else {
        /**
         * Unpublish chapter + ALL descendants (atomic)
         */
        const { error } = await supabase.rpc(
            "unpublish_chapter_and_descendants",
            {
                p_chapter_id: chapterId,
            }
        );

        if (error) {
            throw new Error(error.message);
        }
    }

    /**
     * 5. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}`);
}
