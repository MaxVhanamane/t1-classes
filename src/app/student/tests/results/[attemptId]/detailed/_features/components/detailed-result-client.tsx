"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { SectionSidebar } from "./section-sidebar";
import { QuestionViewer } from "./question-viewer";
import { MobileSectionDrawer } from "./mobile-section-drawer";

import { AnalysisLoadingScreen } from "./analysis-loading-screen.tsx";
import { useSections } from "../hooks/use-get-sections";
import { useResultSummary } from "../../../_features/hooks/use-result-summary";
import { useSectionQuestions } from "../hooks/use-section-questions";

export function DetailedResultClient() {
  const { attemptId } = useParams<{
    attemptId: string;
  }>();

  /* ---------------- Queries ---------------- */

  const sectionsQuery = useSections(attemptId);

  const summaryQuery = useResultSummary(attemptId);

  /* ---------------- State ---------------- */

  const [selected, setSelected] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  /* ---------------- Active Section ---------------- */

  const active =
    selected ??
    (sectionsQuery.data?.kind === "ok"
      ? (sectionsQuery.data.sections[0]?.id ?? null)
      : null);

  /* ---------------- Questions Query ---------------- */

  const questionsQuery = useSectionQuestions(attemptId, active, page);

  /* reset page on section change */
  const changeSection = (id: string) => {
    setSelected(id);
    setPage(1);
  };

  /* ---------------- Loading ---------------- */

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

  // Calculate the total number of questions in all preceding sections
  const activeSectionIndex = sections.findIndex((s) => s.id === active);
  const previousQuestionCount = sections
    .slice(0, Math.max(0, activeSectionIndex))
    .reduce((total, section) => total + (section.questionCount ?? 0), 0);

  const questionData =
    questionsQuery.data?.kind === "ok" ? questionsQuery.data : null;

  return (
    <div className="flex h-(--h-viewport-minus-navbar) overflow-hidden bg-background w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[60%]">
        <SectionSidebar
          sections={sections}
          active={active}
          onChange={changeSection}
          summary={summaryQuery.data?.kind === "ok" ? summaryQuery.data : null}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full">
        <MobileSectionDrawer
          sections={sections}
          active={active}
          onChange={changeSection}
          summary={summaryQuery.data?.kind === "ok" ? summaryQuery.data : null}
          sectionTitle={activeSection?.title}
          subjectLabel={activeSection?.subjectLabel}
          fullMarks={activeSection?.fullMarks}
          negativeMarks={activeSection?.negativeMarks}
          partialMarks={activeSection?.partialMarks}
          questionCount={activeSection?.questionCount}
          sectionSummary={questionData?.summary ?? null}
          isSectionSummaryLoading={questionsQuery.isLoading}
          currentPage={questionData?.page ?? 1}
          totalPages={questionData?.totalPages ?? 1}
        />

        <div className="overflow-y-auto">
          {active && (
            <QuestionViewer
              loading={questionsQuery.isLoading}
              data={questionsQuery.data ?? null}
              page={page}
              setPage={setPage}
              sectionTitle={activeSection?.title ?? ""}
              subjectLabel={activeSection?.subjectLabel}
              fullMarks={activeSection?.fullMarks}
              negativeMarks={activeSection?.negativeMarks}
              partialMarks={activeSection?.partialMarks}
              rankingAvailableAt={
                summaryQuery.data?.kind === "ok"
                  ? summaryQuery.data.rankingAvailableAt
                  : null
              }
              rank={
                summaryQuery.data?.kind === "ok" ? summaryQuery.data.rank : null
              }
              previousQuestionCount={previousQuestionCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
