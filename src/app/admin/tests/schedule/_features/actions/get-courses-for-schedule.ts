"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { CourseRow } from "../types/audience.types";

export async function getCourses(): Promise<CourseRow[]> {
    await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("courses")
        .select("id, title, is_active")
        .eq("is_active", true)
        .order("title");

    if (error) {
        console.error("[GET_COURSES_ERROR]", error);
        throw new Error("FAILED_TO_FETCH_COURSES");
    }

    return data as CourseRow[];
}
