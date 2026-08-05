"use client";

import { Loader } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { QuestionCard } from "./question-card";
import { MetaStrip } from "./meta-strip";
import { SectionSummaryAccordion } from "./section-summary-accordion";

import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";
import {
  QuestionsPageResponse,
  SectionReviewSummary,
} from "../types/question-details.types";
import { Pagination } from "@/src/components/ui/pagination/pagination";

const PAGE_LIMIT = 25;

type Props = {
  loading: boolean;
  data: QuestionsPageResponse | null;

  page: number;
  setPage: (page: number) => void;

  sectionTitle: string;
  subjectLabel?: string;
  fullMarks?: number;
  negativeMarks?: number;
  partialMarks?: PartialMarkingByCorrectCount | null | undefined;
  rank: number | null;
  rankingAvailableAt: string | null;
  previousQuestionCount: number;

  summary: SectionReviewSummary | null;
};

export function QuestionViewer({
  loading,
  data,
  setPage,
  sectionTitle,
  subjectLabel,
  fullMarks,
  negativeMarks,
  partialMarks,
  rank,
  rankingAvailableAt,
  previousQuestionCount,
  summary,
}: Props) {
  // If summary isn't available yet, we can't render the header.
  if (!summary) return null;

  // Safely extract pagination details for the MetaStrip even while loading
  const currentPage = data?.kind === "ok" ? data.page : 1;
  const totalPages = data?.kind === "ok" ? data.totalPages : 1;

  return (
    <div className="w-full">
      {/* Desktop Header - ALWAYS VISIBLE, sticky to the top of the scrolling div */}
      <div
        className={cn(
          "hidden md:block sticky top-0 z-20",
          "border-b bg-background/80 backdrop-blur",
        )}
      >
        <div className="px-6 py-3 space-y-1">
          <h2 className="text-sm font-semibold leading-tight">
            {sectionTitle}
          </h2>

          <MetaStrip
            subjectLabel={subjectLabel}
            questionCount={summary.totalQuestions}
            fullMarks={fullMarks}
            negativeMarks={negativeMarks}
            partialMarks={partialMarks}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          <SectionSummaryAccordion summary={summary} />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 md:p-6 space-y-6">
        {loading ? (
          <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-2">
            <Loader className="animate-spin text-muted-foreground" />
            <span className="text-xs">Fetching questions...</span>
          </div>
        ) : !data || data.kind !== "ok" ? (
          <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg bg-muted/10">
            Unable to load questions
          </div>
        ) : (
          <>
            {/* Render Questions */}
            {data.questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                index={
                  previousQuestionCount + (currentPage - 1) * PAGE_LIMIT + i + 1
                }
                question={q}
                rank={rank}
                rankingAvailableAt={rankingAvailableAt}
              />
            ))}

            {/* Render Pagination */}
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalCount={summary.totalQuestions}
              pageSize={PAGE_LIMIT}
              onPageChange={setPage}
              itemLabel="Questions"
            />
          </>
        )}
      </div>
    </div>
  );
}
