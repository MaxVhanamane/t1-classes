"use client";

import dynamic from "next/dynamic";

const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading PDF viewer…</p>,
});

export function PdfViewer(props: { pdfUrl: string; watermark: string }) {
  return <PdfViewerInner {...props} />;
}
