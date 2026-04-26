"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    toggleChapterPublishSchema,
    ToggleChapterPublishInput,
} from "../../zod-schema/chapter.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function toggleChapterPublish(
    rawData: ToggleChapterPublishInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = toggleChapterPublishSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid publish data" };
        }

        const { courseId, chapterId, publish } = parsed.data;

        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch chapter
         */
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

        /**
         * 3. Ownership check (admin OR course owner)
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
            return { error: "You are not allowed to update publish state" };
        }

        /**
         * 4. Publish / Unpublish
         */
        if (publish) {
            // Publish only the chapter
            const { error } = await supabase
                .from("course_structure")
                .update({ is_published: true })
                .eq("id", chapterId);

            if (error) {
                console.error("[PUBLISH_CHAPTER_ERROR]", error);
                return { error: "Failed to publish chapter. Please try again." };
            }
        } else {
            // Unpublish chapter and all descendants
            const { error } = await supabase.rpc(
                "unpublish_chapter_and_descendants",
                {
                    p_chapter_id: chapterId,
                }
            );

            if (error) {
                console.error("[UNPUBLISH_CHAPTER_ERROR]", error);
                return { error: "Failed to unpublish chapter. Please try again." };
            }
        }

        /**
         * 5. Revalidate cache
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);

        // Success: no return needed
    } catch (error) {
        console.error("[TOGGLE_CHAPTER_PUBLISH_ERROR]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
