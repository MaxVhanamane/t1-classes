"use client";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";

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
        "relative overflow-hidden border p-5 transition-all duration-200",

        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer ",

        selected &&
          "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20",

        !selected && !disabled && "hover:border-primary/40",
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute right-4 top-4">
          <CheckCircle2 className="size-5 text-green-500" />
        </div>
      )}

      {/* Disabled badge */}
      {disabled && disabledReason && (
        <Badge variant="secondary" className="absolute right-4 top-4">
          {disabledReason}
        </Badge>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pr-10">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">{template.name}</h3>

            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {template.description}
              </ReactMarkdown>
            </div>
          </div>

          <Badge variant="outline" className="shrink-0 capitalize">
            {template.answerMode.replaceAll("_", " ")}
          </Badge>
        </div>

        {/* Marks */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            +{template.defaultFullMarks} Correct
          </Badge>

          <Badge variant="secondary">
            {template.defaultNegativeMarks} Incorrect
          </Badge>

          <Badge variant="secondary">0 Unanswered</Badge>

          {hasPartialMarking && (
            <Badge variant="outline">Partial Marking</Badge>
          )}

          {template.maxSelections && (
            <Badge variant="outline">
              Max {template.maxSelections} selections
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
