"use client";

import { useState } from "react";
import { useSectionQuestions } from "../hooks/use-section-questions";
import { QuestionCard } from "./question-card";
import { PaginationBar } from "./pagination-bar";
import { Loader } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MetaStrip } from "./meta-strip";
import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";

/* ---------------------------------- */
type Props = {
  attemptId: string;
  sectionId: string;
  sectionTitle: string;
  subjectLabel?: string;
  fullMarks?: number;
  negativeMarks?: number;
  partialMarks?: PartialMarkingByCorrectCount | null | undefined;
  questionCount?: number;
};

const LIMIT = 10;

/* ---------------------------------- */
export function QuestionViewer({
  attemptId,
  sectionId,
  sectionTitle,
  subjectLabel,
  fullMarks,
  negativeMarks,
  partialMarks,
  questionCount,
}: Props) {
  const [page, setPage] = useState(1);

  const query = useSectionQuestions(attemptId, sectionId, page);

  /* ---------------- Loading ---------------- */
  if (query.isLoading) {
    return (
      <div
        className="h-[calc(var(--h-viewport-minus-navbar)-108.78px)]
  md:h-(--h-viewport-minus-navbar) w-full flex items-center justify-center flex-col gap-2"
      >
        <Loader className="animate-spin text-muted-foreground" />
        <span className="text-xs">Fetching questions...</span>
      </div>
    );
  }

  if (!query.data) return null;

  if (query.data.kind !== "ok") {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Unable to load questions
      </div>
    );
  }

  const { questions, page: currentPage, totalPages } = query.data;

  return (
    <div className="w-full">
      {/* ================= Desktop Sticky Header ================= */}
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
            questionCount={questionCount}
            fullMarks={fullMarks}
            negativeMarks={negativeMarks}
            partialMarks={partialMarks}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* ================= Questions ================= */}
      <div className="p-6 space-y-6">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={(currentPage - 1) * LIMIT + i + 1}
            question={q}
          />
        ))}

        <PaginationBar
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
