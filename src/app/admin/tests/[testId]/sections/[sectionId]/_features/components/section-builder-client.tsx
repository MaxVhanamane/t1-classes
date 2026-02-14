"use client";

import { useState } from "react";
import { SectionBuilderHeader } from "./section-builder-header";
import { SectionRulesCard } from "./section-rules-card";
import { QuestionsList } from "./questions/questions-list";
import { QuestionsEmptyState } from "./questions/questions-empty-state";
import { QuestionBuilderDialog } from "./question-builder/question-builder-dialog";
import { TestSection } from "../types/section.types";
import { TestQuestion } from "../types/question.types";

interface Props {
  testId: string;
  section: TestSection;
  questions: TestQuestion[];
}

export function SectionBuilderClient({ testId, section, questions }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestQuestion | null>(null);

  function handleAdd() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(q: TestQuestion) {
    setEditing(q);
    setOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
      <SectionBuilderHeader
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
