import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

/* Delete function */

export async function deleteR2Object(
    bucket: string,
    key: string
) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        await s3.send(command);
    } catch (err) {
        console.error("[R2_DELETE_ERROR]", err);
    }
}
