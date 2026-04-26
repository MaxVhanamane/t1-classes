"use client";

import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { JSONContent } from "@tiptap/react";

export function ExplanationAccordion({
  explanation,
}: {
  explanation: JSONContent;
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="exp">
        <AccordionTrigger>View Explanation</AccordionTrigger>
        <AccordionContent>
          <RichTextRenderer content={explanation} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
