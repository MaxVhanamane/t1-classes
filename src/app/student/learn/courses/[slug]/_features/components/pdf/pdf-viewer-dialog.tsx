"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import {
  ChevronRight,
  Loader,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { CourseUnitContent } from "../../types/course-unit-content";

import { cn } from "@/src/lib/utils";

import { Button } from "@/src/components/ui/button";

import { Slider } from "@/src/components/ui/slider";

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
  const [zoomBarOpen, setZoomBarOpen] = useState(true);
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
     ZOOM
  ========================= */

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.1, 3));
  };

  const zoomOut = () => {
    setScale((s) => Math.max(s - 0.1, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const zoomPercent = Math.round(scale * 100);

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "grid grid-rows-[auto_1fr]",
          "h-dvh w-full max-w-none rounded-none",
          "border-x-0 border-b-0 sm:border",
          "sm:h-[90dvh] sm:w-[95vw] sm:max-w-200 sm:rounded-lg",
          "gap-0 overflow-hidden p-0",
        )}
      >
        {/* ================= HEADER ================= */}

        <DialogHeader className="border-b bg-background px-4 py-3">
          <DialogTitle className="sr-only">Course PDF document</DialogTitle>

          <div className="mr-10 flex items-center justify-between gap-6">
            <div className="line-clamp-1 text-base font-medium">
              {unit?.title ?? "Loading document"}
            </div>

            <div className="flex items-center gap-2 ">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomOut}
                className="h-7 w-7 shrink-0 rounded-full"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                {zoomPercent}%
              </span>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={zoomIn}
                className="h-7 w-7 shrink-0 rounded-full"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={resetZoom}
                className="h-7 w-7 rounded-full ml-1.5"
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
            <>
              <div className="h-full overflow-auto overscroll-contain bg-background pb-24">
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

              {/* ================= FLOATING ZOOM CONTROL ================= */}

              {/* ================= FLOATING ZOOM CONTROL ================= */}

              {/* ================= FLOATING ZOOM CONTROL ================= */}

              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  mass: 0.9,
                }}
                className={cn(
                  "absolute bottom-4 z-20",
                  zoomBarOpen
                    ? "left-1/2 -translate-x-1/2"
                    : "right-3 md:right-8",
                )}
              >
                <AnimatePresence mode="wait">
                  {zoomBarOpen ? (
                    <motion.div
                      key="expanded"
                      initial={{
                        opacity: 0,
                        scale: 0.82,
                        y: 12,
                        filter: "blur(8px)",
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.82,
                        y: 12,
                        filter: "blur(8px)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 20,
                        mass: 0.7,
                      }}
                      className="
  flex w-[min(92vw,420px)] items-center gap-3
  rounded-full border border-border/60
  bg-background/92
  px-3 py-2
  shadow-[0_12px_40px_rgba(0,0,0,0.18)]
  backdrop-blur-xl
  supports-backdrop-filter:bg-background/75
"
                    >
                      {/* Zoom value */}

                      <div
                        className="
    flex h-7 w-14.5 items-center justify-center
    rounded-full
    bg-muted
    px-2.5
    text-xs font-semibold
    tabular-nums
    text-foreground
  "
                      >
                        {zoomPercent}%
                      </div>

                      {/* Slider */}

                      <div className="min-w-0 flex-1 px-1">
                        <Slider
                          value={[zoomPercent]}
                          min={50}
                          max={300}
                          step={1}
                          onValueChange={([value]) => {
                            setScale(value / 100);
                          }}
                          className="
  cursor-pointer

  **:data-[slot=slider-track]:h-1.5
  **:data-[slot=slider-track]:bg-muted

  **:data-[slot=slider-range]:bg-primary

  **:[role=slider]:h-4
  **:[role=slider]:w-4
  **:[role=slider]:border
  **:[role=slider]:border-border
  **:[role=slider]:bg-primary
  **:[role=slider]:shadow-md
  **:[role=slider]:transition-transform
  **:[role=slider]:active:scale-125
"
                        />
                      </div>

                      {/* Reset */}

                      <button
                        type="button"
                        onClick={resetZoom}
                        className="
            flex h-8 w-8 items-center justify-center
            rounded-full
            text-muted-foreground
            transition-all
            hover:bg-muted
            hover:text-foreground
            active:scale-90
          "
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>

                      {/* Collapse */}

                      <button
                        type="button"
                        onClick={() => setZoomBarOpen(false)}
                        className="
            flex h-8 w-8 items-center justify-center
            rounded-full
            text-muted-foreground
            transition-all
            hover:bg-muted
            hover:text-foreground
            active:scale-90
          "
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="collapsed"
                      initial={{
                        opacity: 0,
                        scale: 0.7,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.7,
                        x: 10,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                        mass: 0.6,
                      }}
                      whileTap={{
                        scale: 0.88,
                      }}
                      type="button"
                      onClick={() => setZoomBarOpen(true)}
                      className="
          flex h-11 w-11 items-center justify-center
          rounded-full  border-border border-2
          bg-background/92
          shadow-[0_12px_40px_rgba(0,0,0,0.18)]
          backdrop-blur-xl
          supports-backdrop-filter:bg-background/75
        "
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
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
