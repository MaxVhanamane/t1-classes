"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

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
}: TogglePracticeSetPublishInput) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

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
        throw new Error("Practice set not found");
    }

    /**
     * 2. Validate course
     */
    if (practiceSet.topic.course_id !== courseId) {
        throw new Error("Invalid course");
    }

    /**
     * 3. Ensure topic + chapter exist
     */
    const topic = practiceSet.topic;
    const chapter = topic.parent;

    if (!topic || !chapter || chapter.structure_type !== "chapter") {
        throw new Error("Invalid topic or chapter");
    }

    /**
     * 4. Publish checks
     */
    if (publish) {
        if (!chapter.is_published) {
            throw new Error("Publish the chapter first");
        }

        if (!topic.is_published) {
            throw new Error("Publish the topic first");
        }
    }

    /**
     * 5. Ownership check (admin OR course owner)
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
     * 6. Update publish state
     */
    const { error: updateError } = await supabase
        .from("practice_sets")
        .update({ is_published: publish })
        .eq("id", practiceSetId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    /**
     * 7. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}`);
}
