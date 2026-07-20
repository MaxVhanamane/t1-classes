"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    AddPdfFormInput,
    addPdfFormSchema,
} from "../../../zod-schema/pdf.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function createPdf(
    courseId: string,
    topicId: string,
    filePath: string,
    rawData: AddPdfFormInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = addPdfFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid PDF data" };
        }

        const { title, description, durationMinutes, isFreePreview } =
            parsed.data;

        /**
         * 2. Auth
         */
        const supabase = await createServerSupabaseClient();


        /**
         * 3. Fetch course owner
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
            return {
                error: "You are not allowed to add PDFs to this course",
            };
        }

        /**
         * 4. Compute next sort_order
         */
        const { data: lastUnit, error: lastUnitError } = await supabase
            .from("course_units")
            .select("sort_order")
            .eq("structure_id", topicId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastUnitError) {
            console.error("[CREATE_PDF_SORT_ORDER_ERROR]", lastUnitError);
            return { error: "Failed to determine PDF order" };
        }

        const nextSortOrder = (lastUnit?.sort_order ?? 0) + 1;

        /**
         * 5. Insert PDF unit
         */
        const { error: insertError } = await supabase
            .from("course_units")
            .insert({
                course_id: courseId,
                structure_id: topicId,
                title,
                description: description || null,
                unit_type: "pdf",
                file_path: filePath,
                content_url: null,
                duration_minutes: durationMinutes
                    ? Number(durationMinutes)
                    : null,
                is_free_preview: isFreePreview,
                sort_order: nextSortOrder,
                is_published: false,
                video_provider: null,
            });

        if (insertError) {
            console.error("[CREATE_PDF_INSERT_ERROR]", insertError);
            return { error: "Failed to create PDF. Please try again." };
        }

        /**
         * 6. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
    } catch (error) {
        console.error("[CREATE_PDF_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
