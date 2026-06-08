"use client";

import { Video } from "lucide-react";

import DottedBackground from "@/src/components/dotted-background";

import { Card, CardContent } from "@/src/components/ui/card";

import { LiveClassStatus } from "../../types/live-class.types";

type Props = {
  status: LiveClassStatus;
};

const content: Record<
  LiveClassStatus,
  {
    title: string;
    description: string;
  }
> = {
  live: {
    title: "No Live Classes Right Now",
    description:
      "There are no live classes currently in progress. Check back shortly or refresh to see newly started sessions.",
  },

  upcoming: {
    title: "No Upcoming Classes Scheduled",
    description:
      "There are no upcoming live classes scheduled for your batch at the moment.",
  },

  completed: {
    title: "No Completed Classes Yet",
    description:
      "Completed live classes will appear here once sessions have finished.",
  },
};

export function LiveClassesEmptyState({ status }: Props) {
  return (
    <Card className="relative overflow-hidden border border-dashed md:w-2xl dark:bg-black">
      <DottedBackground />

      <CardContent className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full border">
          <Video className="text-primary size-5" />
        </div>

        <h3 className="text-base font-semibold">{content[status].title}</h3>

        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {content[status].description}
        </p>
      </CardContent>
    </Card>
  );
}
