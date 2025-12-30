"use client";

import { PracticeQuestionItem } from "./practice-question-item";

interface Props {
  courseId: string;
  topicId: string;
  practiceSetId: string;
  questions: {
    id: string;
    question: string;
    correct_answer_explanation: string | null;
    practice_options: {
      id: string;
      option_text: string;
      is_correct: boolean;
    }[];
  }[];
}

export function PracticeQuestionList({
  questions,
  courseId,
  topicId,
  practiceSetId,
}: Props) {
  if (questions.length === 0) {
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
