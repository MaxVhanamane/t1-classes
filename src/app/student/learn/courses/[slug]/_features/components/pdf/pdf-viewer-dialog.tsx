"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Loader, RotateCcw } from "lucide-react";

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

  /* =========================
     MODAL BACK BUTTON
  ========================= */

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

  /* =========================
     BUTTON ZOOM
  ========================= */

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((s) => Math.max(s - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const zoomPercent = Math.round(scale * 100);

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "grid grid-rows-[auto_1fr]",
          "h-dvh w-full max-w-none rounded-none",
          "border-x-0 border-b-0 sm:border",
          "sm:h-[90dvh] sm:w-[95vw] sm:max-w-200 sm:rounded-lg",
          "p-0 overflow-hidden gap-0",
        )}
      >
        {/* ================= HEADER ================= */}

        <DialogHeader className="border-b px-4 py-3 bg-background">
          <DialogTitle className="sr-only">Course PDF document</DialogTitle>

          <div className="mr-10 flex items-center justify-between">
            <div className="line-clamp-1 text-base font-medium">
              {unit?.title ?? "Loading document"}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomOut}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-full shadow-sm"
              >
                <span className="text-lg font-medium leading-none">−</span>
              </Button>

              <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                {zoomPercent}%
              </span>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomIn}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-full shadow-sm"
              >
                <span className="text-lg font-medium leading-none">+</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={resetZoom}
                className="h-9 rounded-full px-3 text-xs font-medium shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ================= BODY ================= */}

        <div className="relative flex-1 overflow-hidden bg-background">
          {loading && <CenteredState message="Preparing your document…" />}

          {!loading && unit?.contentUrl && !pdfReady && (
            <CenteredState message="Loading document…" />
          )}

          {!loading && unit?.contentUrl && (
            <div className="h-full overflow-auto overscroll-contain bg-background">
              <div className="min-h-full px-4 pb-6">
                <div className="w-fit min-w-full">
                  <div className="mx-auto w-fit">
                    <PdfViewerClient
                      scale={scale}
                      url={unit.contentUrl}
                      onLoad={() => setPdfReady(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= HELPERS ================= */

function CenteredState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader className="h-6 w-6 animate-spin" />

      <p className="text-sm">{message}</p>
    </div>
  );
}
