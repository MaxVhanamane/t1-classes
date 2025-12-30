"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerInner({
  pdfUrl,
  watermark,
}: {
  pdfUrl: string;
  watermark: string;
}) {
  const [numPages, setNumPages] = useState<number>();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative rounded-lg bg-white shadow-sm p-4">
          {/* Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
            <p className="rotate-[-30deg] text-4xl font-bold text-gray-500">
              {watermark}
            </p>
          </div>

          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p>Loading PDF…</p>}
          >
            {Array.from({ length: numPages || 0 }).map((_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
