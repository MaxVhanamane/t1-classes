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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TestQuestion } from "../../types/question.types";
import { deleteQuestion } from "../../actions/delete-question";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  question: TestQuestion;
  testId: string;
  sectionId: string;
  onEdit: () => void;
  is_locked: boolean;
}

export function QuestionActionsMenu({
  question,
  testId,
  sectionId,
  is_locked,
  onEdit,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();
  async function handleDelete() {
    setLoading(true);
    const toastId = toast.loading("Deleting question...");

    const { error } = await callServerAction(
      deleteQuestion(question.id, testId, sectionId),
    );

    if (error) {
      toast.error(error, { id: toastId });
    } else {
      toast.success("Deleted", { id: toastId });
    }

    setLoading(false);
    setConfirmOpen(false);
    await queryClient.invalidateQueries({
      queryKey: ["section-questions", sectionId],
    });
  }

  function handleDeleteBtnClick() {
    if (is_locked) {
      toast.info(
        "This test is locked because it has already been scheduled or attempted. Delete the distribution to enable editing if the test has not started.",
      );
      return;
    }

    setConfirmOpen(true);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

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
            onClick={handleDeleteBtnClick}
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
