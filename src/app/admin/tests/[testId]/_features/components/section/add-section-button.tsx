"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SectionTemplateSheet } from "./section-template-sheet";
import { TestType } from "../../../../create/_features/types/create-test.types";

export function AddSectionButton({
  testId,
  testType,
  isLocked,
}: {
  testId: string;
  testType: TestType;
  isLocked: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      toast.info(
        "This test is locked because it has already been scheduled or attempted. Sections cannot be modified.",
      );
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button
        className="cursor-pointer"
        onClick={handleClick}
        variant={isLocked ? "secondary" : "default"}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add section
      </Button>

      {!isLocked && (
        <SectionTemplateSheet
          open={open}
          onOpenChange={setOpen}
          testId={testId}
          testType={testType}
        />
      )}
    </>
  );
}
