"use client";

import { Loader } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { QuestionCard } from "./question-card";
import { MetaStrip } from "./meta-strip";
import { SectionSummaryAccordion } from "./section-summary-accordion";

import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";
import { QuestionsPageResponse } from "../types/question-details.types";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { LIMIT } from "../hooks/use-section-questions";

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
  previousQuestionCount: number; // <-- Added Prop
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
  previousQuestionCount, // <-- Added Prop
}: Props) {
  if (loading) {
    return (
      <div className="h-[calc(var(--h-viewport-minus-navbar)-108.78px)] md:h-(--h-viewport-minus-navbar) w-full flex items-center justify-center flex-col gap-2">
        <Loader className="animate-spin text-muted-foreground" />
        <span className="text-xs">Fetching questions...</span>
      </div>
    );
  }

  if (!data) return null;

  if (data.kind !== "ok") {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Unable to load questions
      </div>
    );
  }

  const { questions, page: currentPage, totalPages, summary } = data;

  return (
    <div className="w-full">
      {/* Desktop Header */}
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

      {/* Questions */}
      <div className="p-3 md:p-6 space-y-6">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            // Add previous sections' total to the current pagination index
            index={previousQuestionCount + (currentPage - 1) * LIMIT + i + 1}
            question={q}
            rank={rank}
            rankingAvailableAt={rankingAvailableAt}
          />
        ))}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalCount={summary.totalQuestions}
          pageSize={LIMIT}
          onPageChange={setPage}
          itemLabel="Questions"
        />
      </div>
    </div>
  );
}
