"use client";

import { useEffect, useState } from "react";
import { PdfViewer } from "./pdf-viewer";
import { ErrorScreen } from "./error-screen";
import { LoadingScreen } from "./loading";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/supabase-client";

export default function ViewerClient() {
  const supabase = createClient();

  const searchParams = useSearchParams();
  const cls = searchParams.get("class");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPdf() {
      if (!cls || !subject || !year) {
        setError("Invalid request");
        setLoading(false);
        return;
      }
      //  Find paper
      const { data: paper, error: paperError } = await supabase
        .from("previous_year_papers")
        .select("*")
        .eq("class", Number(cls))
        .eq("subject", subject.toLocaleLowerCase())
        .eq("year", Number(year))
        .eq("is_active", true)
        .single();

      if (paperError || !paper) {
        setError("Question paper not available");
        setLoading(false);
        return;
      }

      //  Generate signed URL (300 seconds)
      const { data: signed, error: signedError } = await supabase.storage
        .from("pyq-papers")
        .createSignedUrl(paper.file_path, 300);

      if (signedError || !signed) {
        setError("Unable to load paper");
        setLoading(false);
        return;
      }

      setPdfUrl(signed.signedUrl);
      setLoading(false);
    }

    void loadPdf();
  }, [cls, subject, year, supabase]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <PdfViewer pdfUrl={pdfUrl!} watermark="ABC Coaching • Rahul (98765*****)" />
  );
}
