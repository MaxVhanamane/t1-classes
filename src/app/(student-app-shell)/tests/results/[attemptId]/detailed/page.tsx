"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { SectionSidebar } from "./_features/components/section-sidebar";
import { QuestionViewer } from "./_features/components/question-viewer";
import { MobileSectionDrawer } from "./_features/components/mobile-section-drawer";

import { useSections } from "./_features/hooks/use-get-sections";
import { useResultSummary } from "../_features/hooks/use-result-summary";
import { AnalysisLoadingScreen } from "./_features/components/analysis-loading-screen.tsx";

export default function DetailedPage() {
  const { attemptId } = useParams<{
    attemptId: string;
  }>();

  /* ---------------- Queries ---------------- */

  const sectionsQuery = useSections(attemptId);
  const summaryQuery = useResultSummary(attemptId);

  /* ---------------- Selection ---------------- */

  const [selected, setSelected] = useState<string | null>(null);

  const active =
    selected ??
    (sectionsQuery.data?.kind === "ok"
      ? (sectionsQuery.data.sections[0]?.id ?? null)
      : null);

  /* ---------------- Loading sections ONLY ---------------- */

  if (sectionsQuery.isLoading) {
    return <AnalysisLoadingScreen />;
  }

  if (
    sectionsQuery.data?.kind !== "ok" ||
    !sectionsQuery.data.sections.length
  ) {
    return (
      <div className="flex h-(--h-viewport-minus-navbar) items-center justify-center text-sm text-muted-foreground">
        No sections found
      </div>
    );
  }

  const sections = sectionsQuery.data.sections;
  const activeSection = sections.find((s) => s.id === active);
  /* ========================================================= */
  /* Layout */
  /* ========================================================= */

  return (
    <div className="flex h-(--h-viewport-minus-navbar) overflow-hidden bg-background w-full">
      {/* ---------------- Sidebar ---------------- */}

      <div className="hidden md:block w-[60%]">
        <SectionSidebar
          sections={sections}
          summary={summaryQuery.data?.kind === "ok" ? summaryQuery.data : null}
          active={active}
          onChange={setSelected}
        />
      </div>

      {/* ---------------- Content ---------------- */}

      <div className="flex flex-col w-full">
        <MobileSectionDrawer
          sections={sections}
          active={active}
          onChange={setSelected}
          summary={summaryQuery.data?.kind === "ok" ? summaryQuery.data : null}
          sectionTitle={activeSection?.title}
          subjectLabel={activeSection?.subjectLabel}
          fullMarks={activeSection?.fullMarks}
          negativeMarks={activeSection?.negativeMarks}
          partialMarks={activeSection?.partialMarks}
          questionCount={activeSection?.questionCount}
        />

        <div className="overflow-y-auto">
          {active && (
            <QuestionViewer
              attemptId={attemptId}
              sectionId={active}
              sectionTitle={activeSection?.title ?? ""}
              subjectLabel={activeSection?.subjectLabel}
              fullMarks={activeSection?.fullMarks}
              negativeMarks={activeSection?.negativeMarks}
              partialMarks={activeSection?.partialMarks}
              questionCount={activeSection?.questionCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
