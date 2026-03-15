"use client";

import { TestQuestion } from "../../types/question.types";
import { TestSection } from "../../types/section.types";
import { Button } from "@/src/components/ui/button";
import { QuestionCard } from "./question-card";

interface Props {
  section: TestSection;
  questions: TestQuestion[];
  onAddQuestion: () => void;
  onEditQuestion: (q: TestQuestion) => void;
}

export function QuestionsList({
  section,
  questions,
  onAddQuestion,
  onEditQuestion,
}: Props) {
  console.log("questions", questions);
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Questions ({questions.length})
        </h2>

        <Button onClick={onAddQuestion}>Add Question</Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            section={section}
            onEdit={onEditQuestion}
          />
        ))}
      </div>
    </div>
  );
}
