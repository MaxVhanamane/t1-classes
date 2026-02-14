"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";

export function ExplanationAccordion({ explanation }: { explanation: string }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="exp">
        <AccordionTrigger>View Explanation</AccordionTrigger>
        <AccordionContent>
          <div
            dangerouslySetInnerHTML={{
              __html: explanation,
            }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
