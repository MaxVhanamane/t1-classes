"use client";

import { useState } from "react";
import { CheckCircle, Circle, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { McqBuilder } from "./mcq-builder";
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
import { deletePracticeQuestion } from "../../actions/practice-set/delete-practice-question";
import { toast } from "sonner";

interface Props {
  index: number;
  courseId: string;
  topicId: string;
  practiceSetId: string;
  question: {
    id: string;
    question: string;
    correct_answer_explanation: string | null;
    practice_options: {
      id: string;
      option_text: string;
      is_correct: boolean;
    }[];
  };
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

  function toggle() {
    if (editing) return;
    setExpanded((v) => !v);
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
        err instanceof Error ? err.message : "Failed to delete question"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        {/* HEADER – unchanged */}
        <div
          onClick={toggle}
          className={cn(
            "flex items-start justify-between gap-4 px-4 py-3 transition-colors",
            !editing && "cursor-pointer hover:bg-muted/30"
          )}
        >
          <p className="text-sm font-medium leading-relaxed">
            {index}. {question.question}
          </p>

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Actions only when expanded */}
            {expanded && !editing && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4 cursor-pointer" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive cursor-pointer"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 cursor-pointer"
              onClick={toggle}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>

        {/* EXPANDED CONTENT – unchanged */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2">
                {editing ? (
                  <McqBuilder
                    mode="edit"
                    courseId={courseId}
                    topicId={topicId}
                    practiceSetId={practiceSetId}
                    initialData={{
                      questionId: question.id,
                      question: question.question,
                      correct_answer_explanation:
                        question.correct_answer_explanation,
                      options: question.practice_options,
                    }}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {question.practice_options.map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                            opt.is_correct &&
                              "border-green-600/40 bg-green-50/40"
                          )}
                        >
                          {opt.is_correct ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>

                    {question.correct_answer_explanation && (
                      <div className="rounded-md bg-muted p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Explanation
                        </p>
                        <p className="text-sm leading-relaxed">
                          {question.correct_answer_explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONFIRM DELETE */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question and all its options.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive cursor-pointer"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
