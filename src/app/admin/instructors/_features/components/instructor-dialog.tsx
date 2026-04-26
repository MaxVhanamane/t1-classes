"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";

import { ImageCropper } from "@/src/components/ui/media/ImageCropper";
import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { validateImage } from "@/src/lib/helper-functions/validate-image";
import { formatFileSize } from "@/src/lib/helper-functions/format-file-size";

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  SIZE_LIMITS,
} from "@/src/lib/constants/upload.constants";
import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";

import {
  instructorFormSchema,
  InstructorFormValues,
} from "../zod/instructor.schema";
import { Instructor } from "../types/instructor-types";
import { Switch } from "@/src/components/ui/switch";
import { fetchWrapper, HttpError } from "@/src/lib/api/fetch-wrapper";

const AVATAR_MAX_SIZE = SIZE_LIMITS.instructor_avatar;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: Instructor | null;
};

export function InstructorDialog({ open, onOpenChange, instructor }: Props) {
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useR2Upload();

  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEdit = !!instructor?.id;
  const disabled = saving || uploading;

  /* ---------------------------------- */
  /* Form                               */
  /* ---------------------------------- */

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      qualification: "",
      bio: "",
      profile_image: null,
      is_active: true,
    },
  });

  const resetDialogState = useCallback(() => {
    form.reset({
      full_name: "",
      email: "",
      phone: "",
      qualification: "",
      bio: "",
      profile_image: null,
      is_active: true,
    });

    setLocalPreview(null);
    setCropSrc(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form]);

  useEffect(() => {
    if (open && instructor) {
      form.reset({
        full_name: instructor.full_name ?? "",
        email: instructor.email ?? "",
        phone: instructor.phone ?? "",
        qualification: instructor.qualification ?? "",
        bio: instructor.bio ?? "",
        profile_image: instructor.profile_image ?? null,
        is_active: instructor.is_active,
      });
    }
  }, [open, instructor, form]);

  useEffect(() => {
    if (!open) {
      resetDialogState();
    }
  }, [open, resetDialogState]);

  /* ---------------------------------- */
  /* Mutation                           */
  /* ---------------------------------- */

  const mutation = useMutation<Instructor, Error, InstructorFormValues>({
    mutationFn: async (values: InstructorFormValues): Promise<Instructor> => {
      const url = isEdit
        ? `/api/admin/instructors/${instructor!.id}`
        : `/api/admin/instructors`;

      const method = isEdit ? "PUT" : "POST";

      try {
        return await fetchWrapper<Instructor>(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error instanceof HttpError) {
          const body = error.body as
            | {
                message?: string;
                field?: keyof InstructorFormValues;
              }
            | undefined;

          const customError = new Error(
            body?.message || "Failed to save",
          ) as Error & {
            field?: keyof InstructorFormValues;
            status?: number;
          };

          customError.field = body?.field;
          customError.status = error.status;

          throw customError;
        }

        throw error;
      }
    },
  });

  /* ---------------------------------- */
  /* Submit                             */
  /* ---------------------------------- */

  async function handleSubmit(values: InstructorFormValues) {
    if (saving) return; // hard guard

    setSaving(true);

    const toastId = toast.loading("Saving instructor...");

    try {
      /* 1 Save DB first */
      const saved = await mutation.mutateAsync(values);
      const instructorId = isEdit ? instructor!.id : saved.id;

      /* 2 Upload image if exists */
      const file = fileInputRef.current?.files?.[0];

      if (file && instructorId) {
        const upload = await uploadFile({
          file,
          assetType: "instructor_avatar",
          instructorId,
        });

        if (!upload?.key) {
          throw new Error("Image upload failed");
        }

        /* 3 Update avatar */
        const avatarRes = await fetch(
          `/api/admin/instructors/${instructorId}/avatar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile_image: upload.key }),
          },
        );

        if (!avatarRes.ok) {
          throw new Error("Failed to update avatar");
        }
      }

      toast.success("Instructor saved", { id: toastId });

      await queryClient.invalidateQueries({
        queryKey: ["admin-instructors"],
      });

      onOpenChange(false);
    } catch (error: unknown) {
      let message = "Something went wrong while saving.";

      if (error instanceof Error) {
        const err = error as Error & {
          field?: keyof InstructorFormValues;
          status?: number;
        };

        message = err.message;

        // Show inline error for duplicate email
        if (err.field === "email" || err.status === 409) {
          form.setError("email", {
            type: "server",
            message:
              err.message ||
              "This email already exists. Please use a different email.",
          });
        }
      }

      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------- */
  /* UI                                 */
  /* ---------------------------------- */

  const avatarKey = form.watch("profile_image");
  const preview =
    localPreview ?? (avatarKey ? `${R2_BUCKET_PUBLIC_URL}/${avatarKey}` : null);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return; // prevent closing
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-150 max-h-[95vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Instructor" : "Add Instructor"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={`space-y-4 ${disabled ? "opacity-70 pointer-events-none" : ""}`}
        >
          {/* Name */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...form.register("full_name")} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...form.register("phone")} />
          </div>

          {/* Qualification */}
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input {...form.register("qualification")} />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea rows={4} maxLength={600} {...form.register("bio")} />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Image</Label>

            <Input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_EXTENSIONS.join(",")}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const url = await validateImage({
                  file,
                  maxSize: AVATAR_MAX_SIZE,
                  minWidth: 400,
                  minHeight: 400,
                  allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
                });

                if (!url) {
                  e.target.value = "";
                  return;
                }

                setCropSrc(url);
              }}
            />

            <p className="text-xs text-muted-foreground">
              Upload minimum 400×400px. Max size{" "}
              {formatFileSize(AVATAR_MAX_SIZE)}.
            </p>

            {preview && (
              <div className="w-24 h-24 rounded-full overflow-hidden border">
                <Image
                  src={preview}
                  alt="Instructor avatar"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive instructors will not appear on public pages.
              </p>
            </div>

            <Switch
              checked={form.watch("is_active")}
              onCheckedChange={(checked) =>
                form.setValue("is_active", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>

        {/* Cropper */}
        <ImageCropper
          open={!!cropSrc}
          src={cropSrc}
          aspect={1}
          shape="round"
          output={IMAGE_OUTPUTS.INSTRUCTOR_AVATAR}
          maxSize={AVATAR_MAX_SIZE}
          onCancel={() => {
            if (cropSrc) URL.revokeObjectURL(cropSrc);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setCropSrc(null);
          }}
          onComplete={(file) => {
            const previewUrl = URL.createObjectURL(file);
            setLocalPreview(previewUrl);

            if (fileInputRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            }

            if (cropSrc) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
