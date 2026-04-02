import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuth } from "@/src/lib/auth/get-auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ================================================== */
/* Types                                              */
/* ================================================== */

type CourseUnitContent = {
    id: string;
    title: string;
    unitType: "video" | "pdf";
    description: string | null;
    durationMinutes: number | null;
    contentUrl?: string;
    videoProvider?: "youtube" | "vimeo";
    filePath?: string;
};

/* ================================================== */
/* R2 client — module-level singleton                 */
/* ================================================== */

const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

/* ================================================== */
/* Main function                                      */
/* ================================================== */

export async function getCourseUnitContent(
    unitId: string
): Promise<CourseUnitContent> {
    console.time('getCourseUnitContent');
    // Create supabase client ONCE and share it
    const supabase = await createServerSupabaseClient();

    /* -----------------------------------------------
       1. Auth + unit fetch IN PARALLEL
       Auth doesn't depend on the unit, so fire both
       at the same time
    ----------------------------------------------- */

    const [userResult, unitResult] = await Promise.all([
        getAuth(),
        supabase
            .from("course_units")
            .select(`
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
            `)
            .eq("id", unitId)
            .single(),
    ]);

    const user = userResult;
    const { data: unit, error } = unitResult;

    if (error || !unit) {
        throw new Error("Course unit not found");
    }

    if (!unit.is_published) {
        throw new Error("Content not available");
    }

    /* -----------------------------------------------
       2. Free preview shortcut — skip all DB access
          checks if unit is free preview
    ----------------------------------------------- */

    const isFreePreview = unit.is_free_preview === true;

    if (!isFreePreview) {
        if (!user) {
            throw new Error("You do not have access to this content");
        }

        /* -------------------------------------------
           3. Access check — ONE query using a JOIN
              instead of 3 separate queries
        ------------------------------------------- */

        const now = new Date().toISOString();

        // Direct course enrollment
        const { count: courseCount } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.userId)
            .eq("target_type", "course")
            .eq("course_id", unit.course_id)
            .in("status", ["ongoing", "paused"])
            .lte("access_starts_at", now)
            .or(`access_ends_at.is.null,access_ends_at.gte.${now}`);

        if ((courseCount ?? 0) === 0) {
            // No direct enrollment — check batch access in ONE query
            // by joining batch_courses and enrollments together
            const { count: batchCount } = await supabase
                .from("enrollments")
                .select(
                    `id, batch_courses!inner(course_id)`,
                    { count: "exact", head: true }
                )
                .eq("user_id", user.userId)
                .eq("target_type", "batch")
                .eq("batch_courses.course_id", unit.course_id)
                .in("status", ["ongoing", "paused"])
                .lte("access_starts_at", now)
                .or(`access_ends_at.is.null,access_ends_at.gte.${now}`);

            if ((batchCount ?? 0) === 0) {
                throw new Error("You do not have access to this content");
            }
        }
    }

    /* -----------------------------------------------
       4. Sign PDF URL if needed
          user is already verified above — no second
          getAuth() call needed
    ----------------------------------------------- */

    let contentUrl: string = unit.content_url;

    if (unit.unit_type === "pdf") {
        if (!unit.file_path) {
            throw new Error("PDF file path missing");
        }

        const command = new GetObjectCommand({
            Bucket: process.env.R2_PRIVATE_BUCKET_NAME!,
            Key: unit.file_path,
        });

        const url = await getSignedUrl(s3, command, {
            expiresIn: 60 * 5, // 5 minutes
        });

        if (!url) {
            throw new Error("Failed to generate signed PDF URL");
        }

        contentUrl = url;
    }

    /* -----------------------------------------------
       5. Return
    ----------------------------------------------- */
    console.timeEnd('getCourseUnitContent');
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
