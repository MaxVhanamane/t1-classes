"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { deletePracticeQuestion } from "../../practice/[practiceSetId]/actions/practice-set/delete-practice-question";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";
import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";
import { PracticeMcqBuilderDialog } from "./mcq-builder";
import { PracticeQuestion } from "../../types/practice-question.types";

interface Props {
  index: number;
  courseId: string;
  topicId: string;
  practiceSetId: string;
  question: PracticeQuestion;
}

export function PracticeQuestionItem({
  question,
  index,
  courseId,
  topicId,
  practiceSetId,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const correctOptionId = question.correct_answer?.option_id;

  const sortedOptions = [...question.practice_question_options].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  function toggle() {
    if (editing) return;
    setExpanded((prev) => !prev);
  }

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    try {
      await deletePracticeQuestion({
        courseId,
        topicId,
        practiceSetId,
        questionId: question.id,
      });

      toast.success("Question deleted");
      setConfirmDelete(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete question",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        {/* HEADER */}
        <div
          onClick={toggle}
          className={cn(
            "flex items-start justify-between gap-4 px-4 py-3 transition-colors",
            !editing && "cursor-pointer hover:bg-muted/30",
          )}
        >
          <div className="flex items-start gap-2 text-sm font-medium leading-relaxed">
            <span className="shrink-0">{index}.</span>
            <div className="flex-1 [&>p]:inline [&>p]:m-0">
              <RichTextRenderer content={question.question} />
            </div>
          </div>
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {expanded && !editing && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button variant="ghost" size="icon" onClick={toggle}>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          </div>
        </div>

        {/* EXPANDED CONTENT */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2">
                {editing ? (
                  <PracticeMcqBuilderDialog
                    open={editing}
                    onOpenChange={setEditing}
                    courseId={courseId}
                    topicId={topicId}
                    practiceSetId={practiceSetId}
                    editingQuestion={{
                      id: question.id,
                      questionText: question.question,
                      explanation: question.explanation,
                      options: sortedOptions.map((opt) => ({
                        id: opt.id,
                        label: opt.option_label,
                        text: opt.option_text,
                        isCorrect: opt.id === correctOptionId,
                      })),
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Options */}
                    <div className="space-y-2">
                      {sortedOptions.map((opt) => {
                        const isCorrect = opt.id === correctOptionId;

                        return (
                          <div
                            key={opt.id}
                            className={cn(
                              "flex gap-2 rounded-md border px-3 py-2 text-sm transition",
                              isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-muted",
                            )}
                          >
                            <span className="font-medium w-6">
                              {opt.option_label}.
                            </span>

                            <div className="flex-1">
                              <RichTextRenderer content={opt.option_text} />
                            </div>

                            {isCorrect && (
                              <Badge
                                variant="secondary"
                                className="ml-auto bg-green-600 text-white"
                              >
                                Correct
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="rounded-md bg-muted p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Explanation
                        </p>
                        <RichTextRenderer content={question.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question and all its options.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
