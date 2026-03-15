import { NextRequest, NextResponse } from "next/server";
import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import {
    flexibleChecksumsMiddlewareOptions,
} from "@aws-sdk/middleware-flexible-checksums";

/* ================================================== */
/* ENV                                                */
/* ================================================== */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!;
const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;
const PUBLIC_BASE_URL =
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!;

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

/* Remove checksum middleware (R2 compatibility) */
s3.middlewareStack.remove(
    flexibleChecksumsMiddlewareOptions.name!
);

/* ================================================== */
/* TYPES                                              */
/* ================================================== */

type AssetType =
    | "course_thumbnail"
    | "instructor_avatar"
    | "user_avatar"
    | "course_pdf"
    | "batch_thumbnail"

/* ================================================== */
/* MIME MAPS                                          */
/* ================================================== */

const IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
};

const PDF_TYPES = {
    "application/pdf": "pdf",
};

/* ================================================== */
/* SIZE LIMITS                                        */
/* ================================================== */

export const SIZE_LIMITS: Record<
    AssetType,
    number
> = {
    course_thumbnail: 500 * 1024, // 500KB
    batch_thumbnail: 500 * 1024,
    instructor_avatar: 500 * 1024,
    user_avatar: 200 * 1024,
    course_pdf: 5 * 1024 * 1024, // 5MB
};

/* ================================================== */
/* POST                                               */
/* ================================================== */

export async function POST(req: NextRequest) {
    try {
        /* ---------------- Auth ---------------- */

        await getCurrentStaff();

        /* ---------------- Body ---------------- */

        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json(
                { message: "Invalid body" },
                { status: 400 }
            );
        }

        const assetType: AssetType = body.assetType;
        const fileType: string = body.fileType;
        const fileSize: number = body.fileSize;

        const courseId: string | undefined =
            body.courseId;
        const instructorId: string | undefined =
            body.instructorId;
        const userId: string | undefined =
            body.userId;
        const batchId: string | undefined = body.batchId;

        if (!assetType) {
            return NextResponse.json(
                { message: "assetType required" },
                { status: 400 }
            );
        }

        /* ================================================== */
        /* Extension validation                               */
        /* ================================================== */

        let ext: string | undefined;

        if (assetType === "course_pdf") {
            ext =
                PDF_TYPES[
                fileType as keyof typeof PDF_TYPES
                ];
        } else {
            ext =
                IMAGE_TYPES[
                fileType as keyof typeof IMAGE_TYPES
                ];
        }

        if (!ext) {
            return NextResponse.json(
                { message: "Unsupported file type" },
                { status: 400 }
            );
        }

        /* ================================================== */
        /* Size validation                                    */
        /* ================================================== */

        if (fileSize > SIZE_LIMITS[assetType]) {
            return NextResponse.json(
                { message: "File too large" },
                { status: 400 }
            );
        }

        /* ================================================== */
        /* UNIQUE KEY GENERATION                              */
        /* ================================================== */

        const uuid = crypto.randomUUID();
        const timestamp = Date.now();

        let bucket = R2_PUBLIC_BUCKET_NAME;
        let key = "";

        switch (assetType) {
            case "course_thumbnail": {
                if (!courseId) {
                    return NextResponse.json(
                        { message: "courseId required" },
                        { status: 400 }
                    );
                }

                key = `courses/${courseId}/thumbnail_${timestamp}_${uuid}.${ext}`;
                break;
            }

            case "batch_thumbnail": {
                if (!batchId) {
                    return NextResponse.json(
                        { message: "batchId required" },
                        { status: 400 }
                    );
                }

                key = `batches/${batchId}/thumbnail_${timestamp}_${uuid}.${ext}`;
                break;
            }

            case "instructor_avatar": {
                if (!instructorId) {
                    return NextResponse.json(
                        { message: "instructorId required" },
                        { status: 400 }
                    );
                }

                key = `instructors/${instructorId}/avatar_${timestamp}_${uuid}.${ext}`;
                break;
            }

            case "user_avatar": {
                if (!userId) {
                    return NextResponse.json(
                        { message: "userId required" },
                        { status: 400 }
                    );
                }

                key = `users/${userId}/avatar_${timestamp}_${uuid}.${ext}`;
                break;
            }

            case "course_pdf": {
                if (!courseId) {
                    return NextResponse.json(
                        { message: "courseId required" },
                        { status: 400 }
                    );
                }

                bucket = R2_PRIVATE_BUCKET_NAME;

                key = `courses/${courseId}/pdf_${timestamp}_${uuid}.${ext}`;
                break;
            }
        }

        /* ================================================== */
        /* Signed URL                                         */
        /* ================================================== */

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(
            s3,
            command,
            {
                expiresIn: 60 * 5, // 5 min
            }
        );

        /* ================================================== */
        /* Public URL                                         */
        /* ================================================== */

        const publicUrl =
            bucket === R2_PUBLIC_BUCKET_NAME
                ? `${PUBLIC_BASE_URL}/${key}`
                : null;

        /* ================================================== */
        /* Response                                           */
        /* ================================================== */

        return NextResponse.json({
            signedUrl,
            publicUrl,
            key,
            bucket,
        });
    } catch (error) {
        console.error(
            "[SIGNED_UPLOAD_ERROR]",
            error
        );

        return NextResponse.json(
            {
                message:
                    "Failed to generate upload URL",
            },
            { status: 500 }
        );
    }
}
