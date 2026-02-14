"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

import { Button } from "@/src/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TestQuestion } from "../../types/question.types";
import { deleteQuestion } from "../../actions/delete-question";

interface Props {
  question: TestQuestion;
  testId: string;
  sectionId: string;
  onEdit: () => void;
}

export function QuestionActionsMenu({
  question,
  testId,
  sectionId,
  onEdit,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const toastId = toast.loading("Deleting question...");

    try {
      await deleteQuestion(question.id, testId, sectionId);
      toast.success("Deleted", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Cannot delete question", { id: toastId });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            title="Question actions"
            className="cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4 " />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm Delete */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove the question and all its options.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
