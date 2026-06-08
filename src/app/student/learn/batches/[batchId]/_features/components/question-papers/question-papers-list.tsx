"use client";

import { QuestionPaper } from "../../types/question-paper.types";
import { QuestionPaperCard } from "./question-paper-card";

type QuestionPapersListProps = {
  items: QuestionPaper[];

  loadingId?: string | null;

  onView: (questionPaper: QuestionPaper) => void;
};

export function QuestionPapersList({
  items,
  loadingId,
  onView,
}: QuestionPapersListProps) {
  return (
    <div className="space-y-3">
      {items.map((paper) => (
        <QuestionPaperCard
          key={paper.id}
          questionPaper={paper}
          isLoading={loadingId === paper.id}
          onView={() => onView(paper)}
        />
      ))}
    </div>
  );
}
