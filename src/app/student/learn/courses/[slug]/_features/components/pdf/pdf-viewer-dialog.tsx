"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Loader } from "lucide-react";
import { CourseUnitContent } from "../../types/course-unit-content";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

// react-pdf must be client-only
const PdfViewerClient = dynamic(() => import("./pdf-viewer-client"), {
  ssr: false,
});

type Props = {
  unit: CourseUnitContent | null;
  loading: boolean;
  onClose: () => void;
};

export function PdfViewerDialog({ unit, loading, onClose }: Props) {
  const [pdfReady, setPdfReady] = useState(false);
  const [scale, setScale] = useState(1.0);

  function handleClose() {
    if (window.history.state?.pdfModal) {
      window.history.back();
    } else {
      onClose();
    }
  }

  useEffect(() => {
    window.history.pushState({ pdfModal: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose]);

  /* ================= PINCH ZOOM ================= */

  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(1);
  const isPinching = useRef(false);

  const getTouchDistance = (
    touches: React.TouchEvent<HTMLDivElement>["touches"],
  ) => {
    const dx = touches[0].clientX - touches[1].clientX;

    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2) return;

    isPinching.current = true;

    pinchStartDistance.current = getTouchDistance(e.touches);

    pinchStartScale.current = scale;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPinching.current) return;

    if (e.touches.length !== 2) return;

    e.preventDefault();

    const currentDistance = getTouchDistance(e.touches);

    const zoomFactor = currentDistance / pinchStartDistance.current;

    const nextScale = pinchStartScale.current * zoomFactor;

    const clampedScale = Math.min(Math.max(nextScale, 0.6), 3);

    setScale(clampedScale);
  };

  const handleTouchEnd = () => {
    isPinching.current = false;
  };

  /* ================= BUTTON ZOOM ================= */

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));

  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "grid grid-rows-[auto_1fr]",
          "h-dvh w-full max-w-none rounded-none",
          "sm:h-[90dvh] sm:w-[95vw] sm:max-w-200 sm:rounded-lg",
          "p-0 overflow-hidden",
        )}
      >
        {/* ================= HEADER ================= */}

        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Course PDF document</DialogTitle>

          <div className="flex items-center justify-between mr-10">
            <div className="text-base font-medium line-clamp-1">
              {unit?.title ?? "Loading document"}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomOut}
                className="
                  h-9 w-9 rounded-full
                  shrink-0
                  cursor-pointer
                  shadow-sm
                "
              >
                <span className="text-lg leading-none font-medium">−</span>
              </Button>

              <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                {Math.round(scale * 100)}%
              </span>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomIn}
                className="
                  h-9 w-9 rounded-full
                  shrink-0
                  cursor-pointer
                  shadow-sm
                "
              >
                <span className="text-lg leading-none font-medium">+</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ================= BODY ================= */}

        <div className="relative flex-1 overflow-hidden bg-background">
          {/* Loading: fetching signed URL */}

          {loading && <CenteredState message="Preparing your document…" />}

          {/* Loading: PDF parsing */}

          {!loading && unit?.contentUrl && !pdfReady && (
            <CenteredState message="Loading document…" />
          )}

          {/* PDF */}

          {!loading && unit?.contentUrl && (
            <div
              className="
                h-full
                overflow-auto
                touch-none
              "
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="
                  inline-block
                  min-w-full
                  origin-top
                  transition-transform
                  duration-75
                "
              >
                <PdfViewerClient
                  scale={scale}
                  url={unit.contentUrl}
                  onLoad={() => setPdfReady(true)}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Helpers ================= */

function CenteredState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader className="h-6 w-6 animate-spin" />

      <p className="text-sm">{message}</p>
    </div>
  );
}
