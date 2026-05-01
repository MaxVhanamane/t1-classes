"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

interface ToggleCourseUnitPublishInput {
    courseId: string;
    unitId: string;
    publish: boolean;
}

type ChapterRow = {
    id: string;
    is_published: boolean;
    structure_type: "chapter";
};

type TopicRowWithParent = {
    id: string;
    is_published: boolean;
    parent: ChapterRow;
};

type CourseUnitWithRelations = {
    id: string;
    course_id: string;
    is_published: boolean;
    structure_id: string;
    topic: TopicRowWithParent;
};

export async function toggleCourseUnitPublish({
    courseId,
    unitId,
    publish,
}: ToggleCourseUnitPublishInput): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();


        /**
         * 1. Fetch unit + topic + chapter
         */
        const { data: unit, error: unitError } = await supabase
            .from("course_units")
            .select(
                `
        id,
        course_id,
        is_published,
        structure_id,
        topic:structure_id (
          id,
          is_published,
          parent:parent_id (
            id,
            is_published,
            structure_type
          )
        )
      `
            )
            .eq("id", unitId)
            .single<CourseUnitWithRelations>();

        if (unitError || !unit) {
            return { error: "Content not found" };
        }

        /**
         * 2. Validate course
         */
        if (unit.course_id !== courseId) {
            return { error: "Invalid course" };
        }

        /**
         * 3. Ensure topic exists
         */
        if (!unit.topic) {
            return { error: "Parent topic not found" };
        }

        /**
         * 4. Ensure chapter exists
         */
        if (
            !unit.topic.parent ||
            unit.topic.parent.structure_type !== "chapter"
        ) {
            return { error: "Parent chapter not found" };
        }

        /**
         * 5. Publishing rules
         */
        if (publish) {
            if (!unit.topic.parent.is_published) {
                return { error: "Publish the chapter first" };
            }

            if (!unit.topic.is_published) {
                return { error: "Publish the topic first" };
            }
        }

        /**
         * 6. Ownership check (admin OR course owner)
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
            return {
                error: "You are not allowed to update this content",
            };
        }

        /**
         * 7. Update publish state
         */
        const { error: updateError } = await supabase
            .from("course_units")
            .update({ is_published: publish })
            .eq("id", unitId);

        if (updateError) {
            console.error("[TOGGLE_COURSE_UNIT_PUBLISH_ERROR]", updateError);
            return {
                error: "Failed to update publish state. Please try again.",
            };
        }

        /**
         * 8. Revalidate
         */
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[TOGGLE_COURSE_UNIT_PUBLISH_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
