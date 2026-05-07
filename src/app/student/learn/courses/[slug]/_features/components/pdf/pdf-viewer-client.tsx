"use client";

import { useState } from "react";

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

  return (
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
            scale={scale}
            loading={null}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
