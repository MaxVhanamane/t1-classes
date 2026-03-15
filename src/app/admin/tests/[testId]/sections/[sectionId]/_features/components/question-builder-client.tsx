"use client";

import { useState } from "react";
import { QuestionBuilderHeader } from "./question-builder-header";
import { SectionRulesCard } from "./section-rules-card";
import { QuestionsList } from "./questions/questions-list";
import { QuestionsEmptyState } from "./questions/questions-empty-state";
import { QuestionBuilderDialog } from "./question-builder/question-builder-dialog";
import { TestSection } from "../types/section.types";
import { TestQuestion } from "../types/question.types";
import { useQuestions } from "../react-query-hooks/use-questions";
import { toast } from "sonner";
import { Card } from "@/src/components/ui/card";

interface Props {
  testId: string;
  section: TestSection;
}

export function QuestionBuilderClient({ testId, section }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestQuestion | null>(null);

  const { data: questions = [], isLoading } = useQuestions(section.id);

  function handleAdd() {
    if (section.is_locked) {
      toast.info(
        "This test is locked because it has already been scheduled or attempted.",
      );
      return;
    }
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(q: TestQuestion) {
    if (section.is_locked) {
      toast.info("Locked tests cannot be modified.");
      return;
    }
    setEditing(q);
    setOpen(true);
  }
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl md:px-4 py-2 space-y-6">
        <QuestionBuilderHeader
          testId={testId}
          section={section}
          questionCount={0}
          onAddQuestion={() => {}}
          isLoading={isLoading}
        />

        <SectionRulesCard section={section} />

        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />

          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-lg border p-4 space-y-3 bg-card">
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />

              <div className="grid gap-2 pt-2">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl md:px-4 py-2 space-y-6">
      <QuestionBuilderHeader
        testId={testId}
        section={section}
        questionCount={questions.length}
        onAddQuestion={handleAdd}
      />

      <SectionRulesCard section={section} />

      {questions.length === 0 ? (
        <QuestionsEmptyState
          answerMode={section.answerMode}
          onAddQuestion={handleAdd}
        />
      ) : (
        <QuestionsList
          section={section}
          questions={questions}
          onAddQuestion={handleAdd}
          onEditQuestion={handleEdit}
        />
      )}

      <QuestionBuilderDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        section={section}
        editingQuestion={editing}
      />
    </div>
  );
}
