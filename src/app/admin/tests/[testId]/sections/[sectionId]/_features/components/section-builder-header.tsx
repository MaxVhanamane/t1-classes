"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { TestSection } from "../types/section.types";

interface Props {
  testId: string;
  section: TestSection;
  questionCount: number;
  onAddQuestion: () => void;
}

export function SectionBuilderHeader({
  testId,
  section,
  questionCount,
  onAddQuestion,
}: Props) {
  const router = useRouter();

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
          <Button
            variant="ghost"
            size="sm"
            className="px-0 text-muted-foreground"
            onClick={() => router.push(`/admin/tests/${testId}`)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Sections
          </Button>

          <h1 className="text-xl font-semibold tracking-tight">
            {section.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {questionCount} {questionCount === 1 ? "question" : "questions"} in
            this section
          </p>
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

      <Separator />
    </div>
  );
}
