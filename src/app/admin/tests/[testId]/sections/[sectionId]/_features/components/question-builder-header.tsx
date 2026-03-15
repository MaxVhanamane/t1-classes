"use client";

import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { TestSection } from "../types/section.types";
import { BackLink } from "@/src/components/ui/navigation/back-link";
import LockedBadge from "@/src/components/ui/common/locked-badge";
import { Skeleton } from "@/src/components/ui/skeleton";

interface Props {
  testId: string;
  section: TestSection;
  questionCount: number;
  onAddQuestion: () => void;
  isLoading?: boolean;
}

export function QuestionBuilderHeader({
  testId,
  section,
  questionCount,
  onAddQuestion,
  isLoading,
}: Props) {
  const scoringLimit = section.scoringQuestionCount;

  const needsMoreQuestions =
    section.answerMode === "numerical_input" &&
    scoringLimit !== null &&
    questionCount <= scoringLimit;

  return (
    <div className="space-y-4">
      {/* Top Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <BackLink href={`/admin/tests/${testId}`} label="Back to Sections" />

          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-semibold tracking-tight line-clamp-2">
              {section.title}
            </h1>

            {section.is_locked && <LockedBadge />}
          </div>

          {isLoading ? (
            <Skeleton className="w-40 h-5 rounded-sm" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {questionCount} {questionCount === 1 ? "question" : "questions"}{" "}
              in this section
            </p>
          )}
        </div>

        <Button onClick={onAddQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="capitalize">
          {section.answerMode.replace("_", " ")}
        </Badge>

        {section.subjectLabel && (
          <Badge variant="secondary">Subject: {section.subjectLabel}</Badge>
        )}

        <Badge variant="secondary">Correct: +{section.fullMarks}</Badge>

        {section.negativeMarks < 0 && (
          <Badge variant="secondary">Incorrect: {section.negativeMarks}</Badge>
        )}

        {section.partialMarks && (
          <Badge variant="secondary">Partial marking</Badge>
        )}

        {/* Scoring Rule */}
        {section.answerMode === "numerical_input" && (
          <Badge variant="outline">
            {scoringLimit ? `Best ${scoringLimit} count` : "All count"}
          </Badge>
        )}

        {/* Validation Warning */}
        {needsMoreQuestions && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Add at least {scoringLimit + 1} questions
          </Badge>
        )}
      </div>

      {/* Locked Warning */}
      {section.is_locked && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500 px-3 py-2 text-sm text-amber-400">
          <span>
            This test is locked because it has already been scheduled or
            attempted by students. Questions cannot be modified. If the test is
            only scheduled and has not started yet, you can delete the
            distribution to enable editing.
          </span>
        </div>
      )}

      <Separator />
    </div>
  );
}
