"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, Camera } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";

import { ImageCropper } from "@/src/components/ui/media/ImageCropper";
import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { validateImage } from "@/src/lib/helper-functions/validate-image";

import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  SIZE_LIMITS,
} from "@/src/lib/constants/upload.constants";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
const USER_AVATAR_UPLOAD_LIMIT = 500 * 1024; // 500KB
type UserRow = {
  id: string;
  profile_image: string | null;
};

type Props = {
  user: UserRow;
  onAvatarUpdated: (url: string | null) => void;
};

export function AvatarUploader({ user, onAvatarUpdated }: Props) {
  const { uploadFile, uploading } = useR2Upload();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    user.profile_image ? `${R2_BUCKET_PUBLIC_URL}/${user.profile_image}` : null,
  );

  const disabled = uploading;

  function resetState() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);

    setCropSrc(null);
    setLocalPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* ---------------------------------- */
  /* File selection                     */
  /* ---------------------------------- */

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await validateImage({
      file,
      maxSize: USER_AVATAR_UPLOAD_LIMIT,
      minWidth: 200,
      minHeight: 200,
      allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
    });

    if (!url) {
      e.target.value = "";
      return;
    }

    setCropSrc(url);
  }

  /* ---------------------------------- */
  /* Upload avatar                      */
  /* ---------------------------------- */

  async function uploadAvatar() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading avatar...");

    try {
      const upload = await uploadFile({
        file,
        assetType: "user_avatar",
      });

      if (!upload?.key) {
        throw new Error("Upload failed");
      }

      const res = await fetch("/api/user/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_image: upload.key,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update avatar");
      }
      const versionedUrl = `${R2_BUCKET_PUBLIC_URL}/${upload.key}?v=${Date.now()}`;

      setPreview(versionedUrl);
      onAvatarUpdated(upload.key);
      toast.success("Profile photo updated", { id: toastId });

      setDialogOpen(false);
      resetState();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update avatar", { id: toastId });
    }
  }

  /* ---------------------------------- */
  /* Delete avatar                      */
  /* ---------------------------------- */

  async function removeAvatar() {
    const toastId = toast.loading("Removing avatar...");

    try {
      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete avatar");
      }

      setPreview(null);
      onAvatarUpdated(null);

      toast.success("Profile photo removed", { id: toastId });

      setDialogOpen(false);
      resetState();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove avatar", { id: toastId });
    }
  }

  const displayAvatar = localPreview ?? preview;

  /* ---------------------------------- */
  /* UI                                 */
  /* ---------------------------------- */

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) resetState();
          setDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <button className="relative h-9 w-9 rounded-full shrink-0 overflow-visible bg-muted flex items-center justify-center ring-1 ring-border transition">
            <span className="relative h-full w-full rounded-full overflow-hidden flex items-center justify-center">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </span>

            <span className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
              <Camera className="h-2.5 w-2.5 text-muted-foreground" />
            </span>
          </button>
        </DialogTrigger>

        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Update profile photo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Avatar" fill />
              ) : (
                <Skeleton className="h-full w-full rounded-full" />
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Camera className="mr-2 h-4 w-4" />
              Choose photo
            </Button>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div>
                {preview && (
                  <Button
                    variant="ghost"
                    className="text-destructive"
                    onClick={removeAvatar}
                    disabled={disabled}
                  >
                    Remove photo
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => {
                    setDialogOpen(false);
                    resetState();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  disabled={!localPreview || disabled}
                  onClick={uploadAvatar}
                >
                  {uploading ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleFileChange}
      />

      {/* Cropper */}

      <ImageCropper
        open={!!cropSrc}
        src={cropSrc}
        aspect={1}
        shape="round"
        output={IMAGE_OUTPUTS.USER_AVATAR}
        maxSize={SIZE_LIMITS.user_avatar}
        onCancel={() => {
          if (cropSrc) URL.revokeObjectURL(cropSrc);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          setCropSrc(null);
        }}
        onComplete={(file) => {
          if (file.size > SIZE_LIMITS.user_avatar) {
            toast.error(
              "Image is too large after compression. Try cropping tighter.",
            );
            return;
          }
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
    </>
  );
}
