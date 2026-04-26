"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    PracticeSetInput,
    practiceSetSchema,
} from "../../../../zod-schema/practice-set/practice-set";
import { revalidatePath } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createPracticeSet(
    courseId: string,
    topicId: string,
    rawData: PracticeSetInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = practiceSetSchema.safeParse(rawData);

        if (!parsed.success) {
            return { error: "Invalid practice set data" };
        }

        const { title, description, isFreePreview } = parsed.data;

        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch topic
         */
        const { data: topic, error: topicError } = await supabase
            .from("course_structure")
            .select("id, course_id")
            .eq("id", topicId)
            .single();

        if (topicError || !topic) {
            return { error: "Topic not found" };
        }

        if (topic.course_id !== courseId) {
            return {
                error: "Topic does not belong to this course",
            };
        }

        /**
         * 3. Ownership check
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by")
            .eq("id", topic.course_id)
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
         * 4. Compute next sort_order
         */
        const { data: lastSet, error: lastSetError } = await supabase
            .from("practice_sets")
            .select("sort_order")
            .eq("topic_id", topicId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastSetError) {
            console.error(
                "[CREATE_PRACTICE_SET_SORT_ERROR]",
                lastSetError
            );
            return {
                error: "Failed to determine practice set order",
            };
        }

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
            console.error(
                "[CREATE_PRACTICE_SET_INSERT_ERROR]",
                insertError
            );
            return {
                error: "Failed to create practice set. Please try again.",
            };
        }

        /**
         * 6. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );

        // No return needed on success
    } catch (error) {
        console.error(
            "[CREATE_PRACTICE_SET_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
