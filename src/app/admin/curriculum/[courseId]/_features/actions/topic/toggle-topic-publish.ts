"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

type TopicWithParent = {
    id: string;
    course_id: string;
    parent_id: string;
    structure_type: "topic";
    is_published: boolean;
    parent: {
        id: string;
        is_published: boolean;
        structure_type: "chapter";
    };
};

interface Input {
    courseId: string;
    topicId: string;
    publish: boolean;
}

export async function toggleTopicPublish({
    courseId,
    topicId,
    publish,
}: Input): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();

        /**
         * 1. Fetch topic + parent chapter
         */
        const { data: topic, error: topicError } = await supabase
            .from("course_structure")
            .select(
                `
        id,
        course_id,
        structure_type,
        is_published,
        parent:parent_id (
          id,
          is_published,
          structure_type
        )
      `
            )
            .eq("id", topicId)
            .single<TopicWithParent>();

        if (topicError || !topic) {
            return { error: "Topic not found" };
        }

        /**
         * 2. Ensure this is a topic
         */
        if (topic.structure_type !== "topic") {
            return { error: "Invalid topic" };
        }

        /**
         * 3. Validate course
         */
        if (topic.course_id !== courseId) {
            return { error: "Invalid course" };
        }

        /**
         * 4. Parent chapter must exist
         */
        if (!topic.parent || topic.parent.structure_type !== "chapter") {
            return { error: "Parent chapter not found" };
        }

        /**
         * 5. Chapter must be published before publishing topic
         */
        if (publish && !topic.parent.is_published) {
            return { error: "Publish the chapter first" };
        }

        /**
         * 6. Ownership check
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
         * 7. Publish / Unpublish
         */
        if (publish) {
            const { error } = await supabase
                .from("course_structure")
                .update({ is_published: true })
                .eq("id", topicId);

            if (error) {
                console.error("[PUBLISH_TOPIC_ERROR]", error);
                return { error: "Failed to publish topic. Please try again." };
            }
        } else {
            const { error } = await supabase.rpc(
                "unpublish_topic_and_descendants",
                {
                    p_topic_id: topicId,
                }
            );

            if (error) {
                console.error("[UNPUBLISH_TOPIC_ERROR]", error);
                return { error: "Failed to unpublish topic. Please try again." };
            }
        }

        /**
         * 8. Revalidate
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[TOGGLE_TOPIC_PUBLISH_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
