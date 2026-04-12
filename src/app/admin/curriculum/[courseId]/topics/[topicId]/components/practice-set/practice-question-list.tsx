"use client";

import { PracticeQuestion } from "../../types/practice-question.types";
import { PracticeQuestionItem } from "./practice-question-item";

interface Props {
  courseId: string;
  topicId: string;
  practiceSetId: string;
  questions: PracticeQuestion[];
}

export function PracticeQuestionList({
  questions,
  courseId,
  topicId,
  practiceSetId,
}: Props) {
  if (!questions.length) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        No questions added yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <PracticeQuestionItem
          key={q.id}
          index={index + 1}
          question={q}
          courseId={courseId}
          topicId={topicId}
          practiceSetId={practiceSetId}
        />
      ))}
    </div>
  );
}
