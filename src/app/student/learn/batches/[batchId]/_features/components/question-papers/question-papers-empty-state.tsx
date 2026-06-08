"use client";

import { FileText, PenTool } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { QuestionPaperCategory } from "../../types/question-paper.types";

type Props = {
  category: QuestionPaperCategory;
};

export function QuestionPapersEmptyState({ category }: Props) {
  const config =
    category === "previous_year"
      ? {
          icon: FileText,
          title: "No Previous Year Papers",
          description:
            "Previous year question papers haven't been shared for your batch yet.",
        }
      : {
          icon: PenTool,
          title: "No Practice Papers",
          description:
            "Practice papers will appear here once they are assigned to your batch.",
        };

  const Icon = config.icon;

  return (
    <Card className="relative overflow-hidden border border-dashed md:w-2xl dark:bg-black">
      <DottedBackground />

      <CardContent className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full border">
          <Icon className="text-primary size-5" />
        </div>

        <h3 className="text-base font-semibold">{config.title}</h3>

        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {config.description}
        </p>
      </CardContent>
    </Card>
  );
}
