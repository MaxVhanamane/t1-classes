"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
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
}: Input) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

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
        throw new Error("Topic not found");
    }

    /**
     * 2. Ensure this is a topic
     */
    if (topic.structure_type !== "topic") {
        throw new Error("Invalid topic");
    }

    /**
     * 3. Validate course
     */
    if (topic.course_id !== courseId) {
        throw new Error("Invalid course");
    }

    /**
     * 4. Parent chapter must exist
     */
    if (!topic.parent || topic.parent.structure_type !== "chapter") {
        throw new Error("Parent chapter not found");
    }

    /**
     * 5. Chapter must be published before publishing topic
     */
    if (publish && !topic.parent.is_published) {
        throw new Error("Publish the chapter first");
    }

    /**
     * 6. Ownership check
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
        throw new Error("Not allowed");
    }

    /**
     * 7. Publish / unpublish
     */
    if (publish) {
        // Simple publish (NO cascade)
        const { error } = await supabase
            .from("course_structure")
            .update({ is_published: true })
            .eq("id", topicId);

        if (error) {
            throw new Error(error.message);
        }
    } else {
        // Atomic cascade unpublish
        const { error } = await supabase.rpc(
            "unpublish_topic_and_descendants",
            {
                p_topic_id: topicId,
            }
        );

        if (error) {
            throw new Error(error.message);
        }
    }

    /**
     * 8. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}`);
}
