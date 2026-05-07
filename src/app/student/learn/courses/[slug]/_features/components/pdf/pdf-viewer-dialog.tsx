"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

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
  const [scale, setScale] = useState(1);
  const zoomRef = useRef<QuickPinchZoom | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  /* ================= QUICK PINCH ZOOM ================= */

  const onUpdate = ({
    x,
    y,
    scale,
  }: {
    x: number;
    y: number;
    scale: number;
  }) => {
    if (!contentRef.current) return;

    const value = make3dTransformValue({
      x,
      y,
      scale,
    });

    contentRef.current.style.transform = value;

    setScale(scale);
  };

  /* ================= BUTTON ZOOM ================= */

  const zoomIn = () => {
    zoomRef.current?.scaleTo({
      x: 0,
      y: 0,
      scale: Math.min(scale + 0.2, 4),
    });
  };

  const zoomOut = () => {
    zoomRef.current?.scaleTo({
      x: 0,
      y: 0,
      scale: Math.max(scale - 0.2, 1),
    });
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "grid grid-rows-[auto_1fr]",
          "h-dvh w-full max-w-none rounded-none",
          "border-x-0 border-b-0 sm:border sm:border-b",
          "sm:h-[90dvh] sm:w-[95vw] sm:max-w-200 sm:rounded-lg",
          "overflow-hidden p-0",
        )}
      >
        {/* ================= HEADER ================= */}

        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Course PDF document</DialogTitle>

          <div className="mr-10 flex items-center justify-between">
            <div className="line-clamp-1 text-base font-medium">
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
            <div className="h-full overflow-hidden">
              <QuickPinchZoom
                ref={zoomRef}
                onUpdate={onUpdate}
                inertia
                tapZoomFactor={2}
                minZoom={1}
                maxZoom={4}
                wheelScaleFactor={180}
                doubleTapToggleZoom
              >
                <div
                  ref={contentRef}
                  className="
                    flex
                    min-h-full
                    min-w-full
                    justify-center
                    will-change-transform
                  "
                >
                  <PdfViewerClient
                    scale={1}
                    url={unit.contentUrl}
                    onLoad={() => setPdfReady(true)}
                  />
                </div>
              </QuickPinchZoom>
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
