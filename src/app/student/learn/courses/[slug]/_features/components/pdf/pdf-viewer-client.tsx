"use client";

import { useEffect, useRef, useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfViewerClient({
  url,
  onLoad,
  scale,
}: {
  url: string;
  onLoad: () => void;
  scale: number;
}) {
  const [numPages, setNumPages] = useState(0);

  const [baseWidth, setBaseWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /* =========================
     MEASURE AVAILABLE WIDTH ONCE
  ========================= */

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;

    // leave breathing room for:
    // dialog padding
    // shadows
    // scrollbar
    // mobile safe areas

    setBaseWidth(width - 40);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-col items-center gap-4 py-6">
        <Document
          file={url}
          loading={null}
          onLoadSuccess={(pdf) => {
            setNumPages(pdf.numPages);

            onLoad();
          }}
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={baseWidth > 0 ? baseWidth : undefined}
              scale={scale}
              loading={null}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-6 overflow-hidden rounded-md bg-white "
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
