"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

import { QuestionCard } from "./question-card";

import type { TestQuestion } from "../../types/question.types";
import type { TestSection } from "../../types/section.types";

interface Props {
  question: TestQuestion;

  section: TestSection;

  totalQuestions: number;

  questionsPerPage: number;

  currentPage: number;

  onDismiss: () => void;
}

export function RecentlyAddedQuestion({
  question,
  section,
  totalQuestions,
  questionsPerPage,
  currentPage,
  onDismiss,
}: Props) {
  const lastPage = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));

  const isVisibleOnCurrentPage = currentPage === lastPage;

  return (
    <Card className="border-green-200 bg-green-50/60 p-4 dark:border-green-900 dark:bg-green-950/20">
      <div className=" flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 shrink-0 text-green-600" />

            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Preview of your newly added question
            </h3>
          </div>

          {isVisibleOnCurrentPage ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              This preview helps you quickly verify that the question, answer,
              and explanation were saved correctly. The actual question is
              already visible in the list below, where you can edit or manage it
              if needed.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is a preview of the question you just added. The actual
              question will appear at the bottom of{" "}
              <span className="font-medium text-foreground">
                page {lastPage}
              </span>{" "}
              in the question list, where you can review or edit it later.
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="shrink-0 self-start"
        >
          Dismiss Preview
        </Button>
      </div>

      <QuestionCard
        question={question}
        index={totalQuestions - 1}
        section={section}
        onEdit={() => {}}
        dismissRecentQuestion={onDismiss}
        isPreview
      />
    </Card>
  );
}
