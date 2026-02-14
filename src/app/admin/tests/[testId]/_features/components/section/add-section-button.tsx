"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { SectionTemplateSheet } from "./section-template-sheet";
import { TestType } from "../../../../create/_features/types/create-test.types";

export function AddSectionButton({
  testId,
  testType,
}: {
  testId: string;
  testType: TestType;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add section
      </Button>

      <SectionTemplateSheet
        open={open}
        onOpenChange={setOpen}
        testId={testId}
        testType={testType}
      />
    </>
  );
}
