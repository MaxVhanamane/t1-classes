"use client";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Plus, HelpCircle } from "lucide-react";

interface Props {
  answerMode: string;
  onAddQuestion: () => void;
}

const MODE_HINTS: Record<string, string> = {
  single_select:
    "Create multiple choice questions where only ONE option is correct.",
  multi_select:
    "Create questions where ONE OR MORE options can be correct. Partial marking may apply.",
  numerical_input:
    "Create questions where students must enter a numerical answer.",
  match_matrix:
    "Create matching list questions with paired items and correct combinations.",
};

export function QuestionsEmptyState({ answerMode, onAddQuestion }: Props) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <HelpCircle className="h-8 w-8 text-muted-foreground" />

      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-semibold">
          No questions in this section yet
        </h3>

        <p className="text-sm text-muted-foreground">
          {MODE_HINTS[answerMode] ??
            "Start adding questions to build this section."}
        </p>
      </div>

      <Button onClick={onAddQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Add First Question
      </Button>
    </Card>
  );
}
