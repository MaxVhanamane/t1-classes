"use client";

import { ClipboardCheck, CalendarClock, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { TestStatus } from "../../types/test.types";

type BatchTestsEmptyStateProps = {
  status: TestStatus;
};

const content = {
  ongoing: {
    icon: ClipboardCheck,
    title: "No Ongoing Tests",
    description:
      "There are no active tests right now. Any test currently available to attempt will appear here.",
  },

  scheduled: {
    icon: CalendarClock,
    title: "No Scheduled Tests",
    description:
      "There are no upcoming tests at the moment. Future assessments will appear here once they are scheduled.",
  },

  completed: {
    icon: CheckCircle2,
    title: "No Completed Tests",
    description:
      "You don't have any completed tests yet. Finished assessments and their results will appear here.",
  },
} satisfies Record<
  TestStatus,
  {
    icon: React.ElementType;
    title: string;
    description: string;
  }
>;

export function BatchTestsEmptyState({ status }: BatchTestsEmptyStateProps) {
  const { icon: Icon, title, description } = content[status];

  return (
    <Card className="relative overflow-hidden border border-dashed md:w-2xl dark:bg-black">
      <DottedBackground />

      <CardContent className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full border">
          <Icon className="text-primary size-5" />
        </div>

        <h3 className="text-base font-semibold">{title}</h3>

        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
