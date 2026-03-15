"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

type CreateInput = {
    course_id: string;
    name: string;
    qualification: string | null;
    bio: string | null;
};

export async function createCourseInstructor(
    input: CreateInput,
): Promise<string> {
    await getCurrentStaff();

    const supabase =
        await createServerSupabaseClient();

    const { data, error } =
        await supabase
            .from("course_instructors")
            .insert(input)
            .select("id")
            .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id;
}


type UpdateInput = {
    id: string;
    name: string;
    qualification: string | null;
    bio: string | null;
};

export async function updateCourseInstructor(
    input: UpdateInput,
) {
    await getCurrentStaff();

    const supabase =
        await createServerSupabaseClient();

    const { error } =
        await supabase
            .from("course_instructors")
            .update({
                name: input.name,
                qualification: input.qualification,
                bio: input.bio,
            })
            .eq("id", input.id);

    if (error) {
        throw new Error(error.message);
    }
}


export async function updateInstructorAvatar(
    instructorId: string,
    newKey: string,
) {
    await getCurrentStaff();

    const supabase =
        await createServerSupabaseClient();

    const { data } =
        await supabase
            .from("course_instructors")
            .select("avatar_url")
            .eq("id", instructorId)
            .single();

    const oldKey = data?.avatar_url;

    if (oldKey && oldKey !== newKey) {
        await deleteR2Object(
            process.env.R2_PUBLIC_BUCKET_NAME!,
            oldKey,
        ).catch(console.error);
    }

    const { error } =
        await supabase
            .from("course_instructors")
            .update({
                avatar_url: newKey,
            })
            .eq("id", instructorId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function deleteCourseInstructor(
    instructorId: string,
) {
    await getCurrentStaff();

    const supabase =
        await createServerSupabaseClient();

    const { data } =
        await supabase
            .from("course_instructors")
            .select("avatar_url")
            .eq("id", instructorId)
            .single();

    if (data?.avatar_url) {
        await deleteR2Object(
            process.env.R2_PUBLIC_BUCKET_NAME!,
            data.avatar_url,
        ).catch(console.error);
    }

    await supabase
        .from("course_instructors")
        .delete()
        .eq("id", instructorId);
}
