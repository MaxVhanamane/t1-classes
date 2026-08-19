"use client";

import {
  ClipboardList,
  CalendarClock,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import DottedBackground from "@/src/components/dotted-background";

import { HomeworkStatus } from "../../types/homework.types";

type BatchHomeworkEmptyStateProps = {
  status: HomeworkStatus;
};

const content = {
  overview: {
    icon: CalendarDays,
    title: "No Assignments",
    description: "There are no assignments available for this view.",
  },
  ongoing: {
    icon: ClipboardList,
    title: "No Ongoing Assignments",
    description:
      "You're all caught up! There are no active assignments available right now.",
  },

  scheduled: {
    icon: CalendarClock,
    title: "No Scheduled Assignments",
    description:
      "There are no upcoming assignments at the moment. Future homework will appear here once scheduled.",
  },

  completed: {
    icon: CheckCircle2,
    title: "No Completed Assignments",
    description:
      "You don't have any completed assignments yet. Finished homework and solutions will appear here.",
  },
} satisfies Record<
  HomeworkStatus,
  {
    icon: React.ElementType;
    title: string;
    description: string;
  }
>;

export function BatchHomeworkEmptyState({
  status,
}: BatchHomeworkEmptyStateProps) {
  const { icon: Icon, title, description } = content[status];

  return (
    <Card className="relative overflow-hidden border border-dashed md:max-w-2xl dark:bg-black w-full">
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
