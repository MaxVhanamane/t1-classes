"use client";

import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  sectionId: string;
  answerMode: string;
}

export function AddQuestionButton({}: Props) {
  return (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add Question
    </Button>
  );
}
