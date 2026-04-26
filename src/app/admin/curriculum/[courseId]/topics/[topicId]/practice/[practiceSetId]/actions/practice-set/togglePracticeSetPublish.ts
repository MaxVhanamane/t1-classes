"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

interface TogglePracticeSetPublishInput {
    courseId: string;
    practiceSetId: string;
    publish: boolean;
}

type PracticeSetWithTopicAndChapter = {
    id: string;
    is_published: boolean;
    topic: {
        id: string;
        is_published: boolean;
        course_id: string;
        parent: {
            id: string;
            is_published: boolean;
            structure_type: "chapter";
        };
    };
};

export async function togglePracticeSetPublish({
    courseId,
    practiceSetId,
    publish,
}: TogglePracticeSetPublishInput): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();

        /**
         * 1. Fetch practice set + topic + chapter
         */
        const { data: practiceSet, error: psError } = await supabase
            .from("practice_sets")
            .select(
                `
        id,
        is_published,
        topic:topic_id (
          id,
          is_published,
          parent:parent_id (
            id,
            is_published,
            structure_type
          ),
          course_id
        )
      `
            )
            .eq("id", practiceSetId)
            .single<PracticeSetWithTopicAndChapter>();

        if (psError || !practiceSet) {
            return { error: "Practice set not found" };
        }

        /**
         * 2. Validate course
         */
        if (practiceSet.topic.course_id !== courseId) {
            return { error: "Invalid course" };
        }

        /**
         * 3. Ensure topic + chapter exist
         */
        const topic = practiceSet.topic;
        const chapter = topic?.parent;

        if (!topic || !chapter || chapter.structure_type !== "chapter") {
            return { error: "Invalid topic or chapter" };
        }

        /**
         * 4. Publish checks
         */
        if (publish) {
            if (!chapter.is_published) {
                return { error: "Publish the chapter first" };
            }

            if (!topic.is_published) {
                return { error: "Publish the topic first" };
            }
        }

        /**
         * 5. Ownership check (admin OR course owner)
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
         * 6. Update publish state
         */
        const { error: updateError } = await supabase
            .from("practice_sets")
            .update({ is_published: publish })
            .eq("id", practiceSetId);

        if (updateError) {
            console.error(
                "[TOGGLE_PRACTICE_SET_PUBLISH_ERROR]",
                updateError
            );
            return {
                error:
                    "Failed to update practice set. Please try again.",
            };
        }

        /**
         * 7. Revalidate
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
    } catch (error) {
        console.error(
            "[TOGGLE_PRACTICE_SET_PUBLISH_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
