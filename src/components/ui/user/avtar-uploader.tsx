"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { User, Camera } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Slider } from "@/src/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { createClient } from "@/src/lib/supabase/supabase-client";

type UserRow = {
  id: string;
  profile_image: string | null;
};

type Props = {
  user: UserRow;
  onAvatarUpdated: (url: string | null) => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_INITIAL_SIZE = 5 * 1024 * 1024;
const MAX_FINAL_SIZE = 200 * 1024;

export function AvatarUploader({ user, onAvatarUpdated }: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user.profile_image);
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(
    null
  );

  // -------------------------
  // Reset everything
  // -------------------------
  const resetState = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setUploading(false);
    setOptimisticPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeAvatar = async () => {
    setUploading(true);

    try {
      const filePath = `users/${user.id}.jpg`;

      // 1. Delete from storage (idempotent)
      const { error: storageError } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (storageError) {
        toast.error("Failed to remove photo", {
          description: storageError.message,
        });
        return;
      }

      // 2. Clear DB column via SECURITY DEFINER
      await supabase.rpc("remove_avatar");

      // 3. Update UI
      setPreview(null);
      onAvatarUpdated(null);
      toast.success("Profile photo removed");

      // 4. Close + reset dialog
      setDialogOpen(false);
      resetState();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  // -------------------------
  // File selection
  // -------------------------
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Please choose a JPG, PNG, or WebP image.",
      });
      return;
    }

    if (file.size > MAX_INITIAL_SIZE) {
      toast.error("Image too large", {
        description: "Please choose an image under 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------
  // Crop callback
  // -------------------------
  const onCropComplete = useCallback((_: Area, cropped: Area) => {
    setCroppedArea(cropped);
  }, []);

  // -------------------------
  // Upload logic
  // -------------------------
  const uploadAvatar = async () => {
    if (!imageSrc || !croppedArea) return;

    setUploading(true);

    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedArea);

      const croppedFile = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      const compressed = await imageCompression(croppedFile, {
        maxSizeMB: 0.15,
        maxWidthOrHeight: 256,
        useWebWorker: true,
      });

      if (compressed.size > MAX_FINAL_SIZE) {
        toast.error("Image is still too large", {
          description:
            "Profile photos must be under 200 KB. Try cropping tighter or choose a different image.",
        });
        setUploading(false);
        return;
      }

      const optimisticUrl = URL.createObjectURL(compressed);
      setOptimisticPreview(optimisticUrl);

      const filePath = `users/${user.id}.jpg`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (error) {
        toast.error("Image upload failed", {
          description: error.message,
        });
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const versionedUrl = `${data.publicUrl}?v=${Date.now()}`;

      await supabase.rpc("update_profile_image", {
        url: versionedUrl,
      });

      setPreview(versionedUrl);
      onAvatarUpdated(versionedUrl);
      toast.success("Profile photo updated");

      setDialogOpen(false);
      resetState();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", {
        description: "Please try again.",
      });
    } finally {
      setUploading(false);
      setOptimisticPreview(null);
    }
  };

  // -------------------------
  // UI
  // -------------------------
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
          <button
            className="
    relative h-9 w-9 rounded-full shrink-0
    overflow-visible
    bg-muted flex items-center justify-center
    ring-1 ring-border
    transition
  "
          >
            {/* Avatar image */}
            <span className="relative h-full w-full rounded-full overflow-hidden">
              {optimisticPreview || preview ? (
                <Image
                  src={optimisticPreview || preview!}
                  alt="Edit avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </span>

            {/* Camera badge (half outside) */}
            <span
              className="
      absolute -bottom-1 -right-1
      h-4.5 w-4.5
      rounded-full
      bg-background
      border border-border
      flex items-center justify-center
      shadow-sm
    "
            >
              <Camera className="h-2.5 w-2.5 text-muted-foreground" />
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update profile photo</DialogTitle>
          </DialogHeader>

          {!imageSrc ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                {preview ? (
                  <Image src={preview} alt="Avatar" fill />
                ) : (
                  <Skeleton className="h-full w-full rounded-full" />
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Choose photo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative h-72 w-full rounded-md overflow-hidden bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={([z]) => setZoom(z)}
              />
            </div>
          )}

          <DialogFooter>
            <div className={"flex items-center justify-between w-full"}>
              <div>
                {preview && !imageSrc && (
                  <Button
                    variant="ghost"
                    className="text-destructive cursor-pointer"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDialogOpen(false);
                    resetState();
                  }}
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={uploadAvatar}
                  disabled={!imageSrc || !croppedArea || uploading}
                >
                  {uploading ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={onSelectFile}
      />
    </>
  );
}

// -------------------------
async function getCroppedImage(imageSrc: string, crop: Area): Promise<Blob> {
  const image = document.createElement("img");
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
  });
}
