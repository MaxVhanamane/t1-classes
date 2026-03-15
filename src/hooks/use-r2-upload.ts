"use client";

import { useState } from "react";
import { toast } from "sonner";

/* ================================================== */
/* Types                                              */
/* ================================================== */

export type UploadAssetType =
    | "course_thumbnail"
    | "instructor_avatar"
    | "user_avatar"
    | "course_pdf"
    | "batch_thumbnail";

type UploadParams = {
    file: File;
    assetType: UploadAssetType;
    courseId?: string;
    batchId?: string;
    instructorId?: string;
    userId?: string;
};

type UploadResult = {
    key: string;          // ← primary
    publicUrl?: string;   // ← preview only
    bucket: string;
};

/* ================================================== */
/* Hook                                               */
/* ================================================== */

export function useR2Upload() {
    const [uploading, setUploading] =
        useState(false);

    async function uploadFile({
        file,
        assetType,
        courseId,
        instructorId,
        userId,
        batchId
    }: UploadParams): Promise<UploadResult | null> {
        setUploading(true);

        const toastId =
            toast.loading("Uploading file...");

        try {
            /* ---------------- Signed URL ---------------- */

            const res = await fetch(
                "/api/uploads/signed-url",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        assetType,
                        fileType: file.type,
                        fileSize: file.size,
                        courseId,
                        batchId,
                        instructorId,
                        userId,
                    }),
                }
            );

            if (!res.ok) {
                const err = await res
                    .json()
                    .catch(() => null);

                throw new Error(
                    err?.message ||
                    "Failed to get upload URL"
                );
            }

            const data: {
                signedUrl: string;
                publicUrl?: string;
                key: string;
                bucket: string;
            } = await res.json();

            /* ---------------- Upload ---------------- */

            const uploadRes = await fetch(
                data.signedUrl,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file,
                }
            );

            if (!uploadRes.ok) {
                throw new Error("Upload failed");
            }

            toast.success(
                "Upload successful",
                { id: toastId }
            );


            return {
                key: data.key,
                publicUrl: data.publicUrl,
                bucket: data.bucket,
            };
        } catch (err) {
            console.error(err);

            toast.error("Upload failed", {
                id: toastId,
            });

            return null;
        } finally {
            setUploading(false);
        }
    }

    return {
        uploadFile,
        uploading,
    };
}
