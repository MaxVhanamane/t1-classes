"use client";

import { useState } from "react";
import { SectionTemplateSheet } from "./section-template-sheet";
import type { TestType } from "../../../../create/_features/types/create-test.types";

interface Props {
  testId: string;
  testType: TestType;
  children: React.ReactNode;
}

export function SectionTemplateSheetTrigger({
  testId,
  testType,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      <SectionTemplateSheet
        open={open}
        onOpenChange={setOpen}
        testId={testId}
        testType={testType}
      />
    </>
  );
}
