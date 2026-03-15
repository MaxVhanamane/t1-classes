"use client";

import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";
import { getCroppedImageFile } from "@/src/app/admin/courses/_features/helper-functions/get-cropped-image";
import { createPortal } from "react-dom";

/* -------------------------------------------------- */

type Props = {
  open: boolean;
  src: string | null;

  aspect: number;
  shape?: "rect" | "round";

  output: (typeof IMAGE_OUTPUTS)[keyof typeof IMAGE_OUTPUTS];
  maxSize: number;

  onCancel: () => void;
  onComplete: (file: File) => void;
};

/* -------------------------------------------------- */

export function ImageCropper({
  open,
  src,
  aspect,
  shape = "rect",
  output,
  maxSize,
  onCancel,
  onComplete,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  if (!open || !src) return null;

  async function handleCrop() {
    if (!area || !src) return;

    const file = await getCroppedImageFile(src, area, output);

    if (file.size > maxSize) {
      toast.error("Cropped image exceeds size limit. Zoom more.");
      return;
    }

    onComplete(file);

    /* Reset */
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
  }

  return createPortal(
    <div
      style={{ pointerEvents: "auto" }}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm px-1"
    >
      <div className="w-full max-w-xl rounded-xl border bg-card shadow-xl p-6 space-y-6">
        {/* ---------------- Cropper ---------------- */}
        <div
          style={{ aspectRatio: aspect }}
          className="relative w-full  rounded-md overflow-hidden bg-muted"
        >
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={shape === "round" ? "round" : "rect"}
            objectFit="cover"
            minZoom={1} //  prevents zooming out too much
            maxZoom={5} //  prevents excessive zoom
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        {/* ---------------- Zoom Slider ---------------- */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}×</span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* ---------------- Actions ---------------- */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button onClick={handleCrop}>Crop & Use Image</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
