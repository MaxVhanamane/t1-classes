import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            Section {index + 1}: {section.title}
          </span>

          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {answerModeLabel(section.answer_mode)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Section Instructions */}
        {section.description && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
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
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {INSTRUCTION_COPY.section.markingHeader}
          </p>

          <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs">
            {rules.map((rule) => (
              <div key={rule.label}>
                <span className="font-medium">{rule.label}:</span> {rule.value}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
