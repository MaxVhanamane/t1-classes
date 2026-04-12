"use client";
import { getPracticeQuestionsByPracticeSet } from "../../practice/[practiceSetId]/actions/practice-set/get-practice-questions";
import { Button } from "@/src/components/ui/button";
import { PracticeQuestionList } from "../../components/practice-set/practice-question-list";
import { useState } from "react";
import { PracticeMcqBuilderDialog } from "./mcq-builder";
/* -------------------------------------------------------------------------- */
/* Client Wrapper for Dialog Interaction                                      */
/* -------------------------------------------------------------------------- */
export function PracticeSetClient({
  courseId,
  topicId,
  practiceSetId,
  questions,
}: {
  courseId: string;
  topicId: string;
  practiceSetId: string;
  questions: Awaited<ReturnType<typeof getPracticeQuestionsByPracticeSet>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Add Question Button */}
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>Add Practice Question</Button>
      </div>

      {/* Dialog */}
      <PracticeMcqBuilderDialog
        open={open}
        onOpenChange={setOpen}
        courseId={courseId}
        topicId={topicId}
        practiceSetId={practiceSetId}
      />

      {/* Existing Questions */}
      <PracticeQuestionList
        questions={questions}
        courseId={courseId}
        topicId={topicId}
        practiceSetId={practiceSetId}
      />
    </div>
  );
}
