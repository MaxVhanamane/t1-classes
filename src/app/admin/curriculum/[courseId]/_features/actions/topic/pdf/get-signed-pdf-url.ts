"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuth } from "@/src/lib/auth/get-auth";

/* ================================================== */
/* ENV                                                */
/* ================================================== */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

/* ================================================== */
/* S3 CLIENT                                          */
/* ================================================== */

const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/* ================================================== */
/* GET SIGNED URL                                     */
/* ================================================== */

export async function getPdfSignedUrl(
    filePath: string
): Promise<string> {

    const user = await getAuth();

    if (!user) {
        throw new Error("Unauthorized");
    }

    /**
     * Optional later:
     * - enrollment checks
     * - free preview logic
     */

    const command = new GetObjectCommand({
        Bucket: R2_PRIVATE_BUCKET_NAME,
        Key: filePath,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 60 * 5, // 5 minutes
    });

    return signedUrl;
}
