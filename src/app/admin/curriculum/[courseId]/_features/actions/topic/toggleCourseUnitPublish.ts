"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

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
    parent: ChapterRow; // ← array on purpose
};

type CourseUnitWithRelations = {
    id: string;
    course_id: string;
    is_published: boolean;
    structure_id: string;
    topic: TopicRowWithParent; // ← array on purpose
};


export async function toggleCourseUnitPublish({
    courseId,
    unitId,
    publish,
}: ToggleCourseUnitPublishInput) {
    const supabase = await createServerSupabaseClient();
    const staff = await getAuthIfHasRole(["admin", "teacher"]); // admin OR teacher
    if (!staff) {
        redirect("/login");
    }

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
        throw new Error("Content not found");
    }

    /**
     * 2. Validate course
     */
    if (unit.course_id !== courseId) {
        throw new Error("Invalid course");
    }

    /**
     * 3. Ensure topic exists
     */
    if (!unit.topic) {
        throw new Error("Parent topic not found");
    }

    /**
     * 4. Ensure chapter exists
     */
    if (!unit.topic.parent || unit.topic.parent.structure_type !== "chapter") {
        throw new Error("Parent chapter not found");
    }

    /**
     * 5. Publishing rules
     */
    if (publish) {
        if (!unit.topic.parent.is_published) {
            throw new Error("Publish the chapter first");
        }

        if (!unit.topic.is_published) {
            throw new Error("Publish the topic first");
        }
    }

    /**
     * 6. Ownership check (admin OR course owner)
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
    const isOwner = course.created_by === staff.userId;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to update this content");
    }

    /**
     * 7. Update publish state
     */
    const { error: updateError } = await supabase
        .from("course_units")
        .update({ is_published: publish })
        .eq("id", unitId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    /**
     * 8. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}`);
}
