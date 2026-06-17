"use client";

import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";
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
          <RichTextHTMLContent content={explanation} variant="prose" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
