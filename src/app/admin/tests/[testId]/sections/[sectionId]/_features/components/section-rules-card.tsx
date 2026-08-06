"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import type { TestSection } from "../types/section.types";

interface Props {
  section: TestSection;
}

export function SectionRulesCard({ section }: Props) {
  if (!section.description?.trim()) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="mt-3">
      <AccordionItem value="instructions" className="border-none">
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/30 shadow-none transition-colors hover:border-border">
          <AccordionTrigger className="group px-4 py-3 hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">Section Instructions</span>

              <span className="text-xs text-muted-foreground">
                Expand to review section-specific guidelines
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-border/50 px-4 pb-4 pt-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.description}
              </ReactMarkdown>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
