"use server";

type CourseUnitContent = {
    id: string;
    title: string;
    unitType: "video" | "pdf";
    description: string | null;
    durationMinutes: number | null;

    // gated fields
    contentUrl?: string;
    videoProvider?: "youtube" | "vimeo";
    filePath?: string;
};


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCourseAccess } from "./course-access";
import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";


export async function getCourseUnitContent(
    unitId: string
): Promise<CourseUnitContent> {
    const supabase = await createServerSupabaseClient();

    /* -------------------------------------------------
     * 1. Fetch unit
     * ------------------------------------------------- */
    const { data: unit, error } = await supabase
        .from("course_units")
        .select(
            `
        id,
        title,
        description,
        unit_type,
        duration_minutes,
        is_free_preview,
        content_url,
        video_provider,
        file_path,
        course_id,
        is_published
      `
        )
        .eq("id", unitId)
        .single();

    if (error || !unit) {
        throw new Error("Course unit not found");
    }

    if (!unit.is_published) {
        throw new Error("Content not available");
    }

    /* -------------------------------------------------
     * 2. Access check
     * ------------------------------------------------- */
    const access = await getCourseAccess(unit.course_id);
    const canAccess = access.hasAccess || unit.is_free_preview === true;

    if (!canAccess) {
        throw new Error("You do not have access to this content");
    }

    /* -------------------------------------------------
     * 3. SIGN PDF 
     * ------------------------------------------------- */
    let contentUrl: string = unit.content_url;

    if (unit.unit_type === "pdf") {
        if (!unit.file_path) {
            throw new Error("PDF file path missing");
        }
        const url = await getPdfSignedUrl(unit.file_path);

        if (!url) {
            throw new Error("Failed to generate signed PDF URL");
        }

        contentUrl = url;

    }

    /* -------------------------------------------------
     * 4. Return (unchanged contract)
     * ------------------------------------------------- */
    return {
        id: unit.id,
        title: unit.title,
        description: unit.description,
        unitType: unit.unit_type,
        durationMinutes: unit.duration_minutes,
        contentUrl,
        videoProvider: unit.video_provider,
    };
}
