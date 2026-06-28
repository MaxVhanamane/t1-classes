"use client";

import { QuestionPaper } from "../../types/question-paper.types";
import { QuestionPaperCard } from "./question-paper-card";

type QuestionPapersListProps = {
  items: QuestionPaper[];
  loadingId?: string | null;
  onView: (questionPaper: QuestionPaper) => void;
  layout?: "batch" | "course";
};

export function QuestionPapersList({
  items,
  loadingId,
  onView,
  layout = "batch",
}: QuestionPapersListProps) {
  return (
    <div className="space-y-3">
      {items.map((paper) => (
        <QuestionPaperCard
          key={paper.id}
          questionPaper={paper}
          layout={layout}
          isLoading={loadingId === paper.id}
          onView={() => onView(paper)}
        />
      ))}
    </div>
  );
}
