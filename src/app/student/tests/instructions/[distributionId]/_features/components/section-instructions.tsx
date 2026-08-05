import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";

import { answerModeLabel } from "../helpers/labels";
import { buildRules } from "../helpers/build-rules";
import { SectionRow } from "../types/test-instructions.types";
import { INSTRUCTION_COPY } from "../helpers/copy";

type Props = {
  section: SectionRow;
  index: number;
};

export default function SectionInstructions({ section, index }: Props) {
  const rules = buildRules(section);

  return (
    <AccordionItem
      value={section.id}
      className="overflow-hidden rounded-xl border bg-background px-4 shadow-sm last:border-b sm:px-6"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex w-full flex-col gap-3 pr-4 text-left sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section {index + 1}
            </span>
            <span className="leading-snug wrap-break-word font-semibold text-foreground">
              {section.title}
            </span>
          </div>

          {/* Badge */}
          <span
            className="
         w-fit shrink-0
            rounded-md
            bg-muted
            px-2 py-1
            text-[10px] sm:text-xs
            font-medium
            text-muted-foreground
          "
          >
            {answerModeLabel(section.answer_mode)}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="space-y-6 pb-5 pt-2 text-sm">
        {/* Section Instructions */}
        {section.description && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {INSTRUCTION_COPY.section.instructionsHeader}
            </p>

            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Marking Scheme */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {INSTRUCTION_COPY.section.markingHeader}
          </p>

          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/10 p-3 text-xs sm:grid-cols-4">
            {rules.map((rule) => (
              <div key={rule.label} className="flex flex-col gap-0.5">
                <span className="font-medium text-muted-foreground">
                  {rule.label}:
                </span>{" "}
                <span className="font-semibold text-foreground">
                  {rule.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
