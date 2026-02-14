import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import type { SectionTemplate } from "../../types/section-template.types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  template: SectionTemplate;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  disabledReason: string;
}

export function SectionTemplateCard({
  template,
  selected,
  onSelect,
  disabled = false,
  disabledReason,
}: Props) {
  const hasPartialMarking =
    template.answerMode === "multi_select" &&
    template.defaultPartialMarks !== null;
  return (
    <Card
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "relative p-4 transition border",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        selected
          ? "border-primary bg-primary/5"
          : !disabled && "hover:border-muted-foreground/40",
      )}
    >
      {/* Disabled overlay hint */}
      {disabled && disabledReason && (
        <div className="absolute inset-x-0 top-0 rounded-t-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          {disabledReason}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pt-2">
        <div className="space-y-2">
          <h3 className="font-medium">{template.name}</h3>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {template.description}
            </ReactMarkdown>
          </div>
        </div>

        <Badge variant="outline" className="capitalize shrink-0">
          {template.answerMode.replace("_", " ")}
        </Badge>
      </div>

      {/* Marks summary */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Correct</span>: +
          {template.defaultFullMarks}
        </span>

        {template.defaultNegativeMarks < 0 && (
          <span>
            <span className="font-medium text-foreground">Incorrect</span>:{" "}
            {template.defaultNegativeMarks}
          </span>
        )}

        <span>
          <span className="font-medium text-foreground">Unanswered</span>: 0
        </span>
        {hasPartialMarking && (
          <span className="italic text-muted-foreground">
            Partial marking enabled
          </span>
        )}
      </div>
    </Card>
  );
}
