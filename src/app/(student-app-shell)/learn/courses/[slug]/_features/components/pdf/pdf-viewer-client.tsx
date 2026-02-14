"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
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
  return (
    <div className="flex justify-center py-6 ">
      <Document file={url} onLoadSuccess={onLoad} loading={null}>
        <Page
          loading={null}
          scale={scale}
          pageNumber={1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}
