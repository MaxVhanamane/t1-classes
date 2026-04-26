"use client";

import { useState } from "react";
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

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "grid grid-rows-[auto_1fr]",
          "h-[95dvh] w-[95vw] sm:max-w-200",
          "p-0 overflow-hidden",
        )}
      >
        {/* ================= HEADER ================= */}
        <DialogHeader className="border-b px-4 py-3">
          {/* Accessibility-required title */}

          <DialogTitle className="sr-only">Course PDF document</DialogTitle>

          {/* Visible title */}
          <div className="flex justify-between items-center">
            <div className="text-base font-medium line-clamp-1 ">
              {unit?.title ?? "Loading document"}
            </div>
            <div className="flex items-center gap-2 mr-10">
              <Button
                className="cursor-pointer rounded-full w-8 h-8"
                size="icon"
                variant="outline"
                onClick={zoomOut}
              >
                −
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button
                className="cursor-pointer rounded-full w-8 h-8"
                size="icon"
                variant="outline"
                onClick={zoomIn}
              >
                +
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
            <div className="h-full overflow-auto">
              <div className="inline-block min-w-full">
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
