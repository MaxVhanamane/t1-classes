import "server-only"
import {
    S3Client,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createServiceRoleSupabaseClient } from "../supabase/supabase-service-role";

/* ENV */
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

/* Client */
const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Deletes an object from Cloudflare R2.
 * Logs failures for manual retry.
 */
export async function deleteR2Object(
    bucket: string,
    key: string
): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        await s3.send(command);
    } catch (error) {
        console.error("[R2_DELETE_ERROR]", {
            bucket,
            key,
            error,
        });

        // Log failure for manual review
        try {
            const supabase =
                await createServiceRoleSupabaseClient();

            await supabase.from("r2_deletion_failures").insert({
                bucket_name: bucket,
                file_path: key,
                error_message:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            });
        } catch (dbError) {
            console.error(
                "[R2_DELETE_LOG_FAILED]",
                dbError
            );
        }
    }
}
