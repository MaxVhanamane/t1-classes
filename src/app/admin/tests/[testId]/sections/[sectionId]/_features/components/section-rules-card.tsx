"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

import type { TestSection } from "../types/section.types";

interface Props {
  section: TestSection;
}

export function SectionRulesCard({ section }: Props) {
  const [open, setOpen] = useState(false);

  const hasPartialMarking =
    section.answerMode === "multi_select" && section.partialMarks !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Section Rules</h3>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? (
            <>
              Hide
              <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Row */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {section.answerMode.replace("_", " ")}
          </Badge>

          <span>
            <span className="font-medium text-foreground">Correct</span>: +
            {section.fullMarks}
          </span>

          {section.negativeMarks < 0 && (
            <span>
              <span className="font-medium text-foreground">Incorrect</span>:{" "}
              {section.negativeMarks}
            </span>
          )}

          <span>
            <span className="font-medium text-foreground">Unanswered</span>: 0
          </span>

          {hasPartialMarking && (
            <span className="italic">Partial marking enabled</span>
          )}
        </div>

        {/* Expanded Rules */}
        {open && section.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.description}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
