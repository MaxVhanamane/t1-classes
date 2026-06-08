"use client";

import { useState } from "react";

/* ================================================== */
/* Types                                              */
/* ================================================== */

export type UploadAssetType =
    | "course_thumbnail"
    | "instructor_avatar"
    | "user_avatar"
    | "course_pdf"
    | "batch_thumbnail"
    | "question_paper";

type UploadParams = {
    file: File
    assetType: UploadAssetType
    courseId?: string
    topicId?: string
    batchId?: string
    instructorId?: string
}

type UploadResult = {
    key: string;
    publicUrl?: string;
    bucket: string;
};

/* ================================================== */
/* Hook                                               */
/* ================================================== */

export function useR2Upload() {
    const [uploading, setUploading] = useState(false);

    async function uploadFile({
        file,
        assetType,
        courseId,
        instructorId,
        batchId,
        topicId
    }: UploadParams): Promise<UploadResult> {

        setUploading(true);

        try {
            /* ---------------- Signed URL ---------------- */

            const res = await fetch("/api/uploads/signed-url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    assetType,
                    fileType: file.type,
                    fileSize: file.size,
                    courseId,
                    topicId,
                    batchId,
                    instructorId
                })
            });


            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || "Failed to get upload URL");
            }

            const data: {
                signedUrl: string;
                publicUrl?: string;
                key: string;
                bucket: string;
            } = await res.json();


            /* ---------------- Upload ---------------- */

            const uploadRes = await fetch(data.signedUrl, {
                method: "PUT",
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error("Upload failed");
            }


            return {
                key: data.key,
                publicUrl: data.publicUrl,
                bucket: data.bucket,
            };

        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("File upload failed");
        } finally {
            setUploading(false);
        }
    }

    return { uploadFile, uploading };
}
