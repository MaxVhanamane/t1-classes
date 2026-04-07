"use client";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { AlertTriangle, Clock, Lock, FileCheck, Ban } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { LoadAttemptResponse } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

type DeniedReason = Extract<LoadAttemptResponse, { kind: "denied" }>["reason"];

type Props = {
  reason: DeniedReason;
};

const CONFIG: Record<
  DeniedReason,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    accent: string;
  }
> = {
  expired: {
    title: "Time’s Up",
    description:
      "Your time limit for this test has ended. This attempt is now locked and cannot be continued.",
    icon: Clock,
    accent: "border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400",
  },

  submitted: {
    title: "Test Already Submitted",
    description:
      "You have already submitted this test. You can view your results from the dashboard.",
    icon: FileCheck,
    accent:
      "border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400",
  },

  not_owner: {
    title: "Access Restricted",
    description:
      "This test attempt does not belong to your account. Please check your dashboard for your active tests.",
    icon: Lock,
    accent:
      "border-yellow-500/40 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400",
  },

  not_enrolled: {
    title: "Not Enrolled",
    description:
      "You are not enrolled in this course or batch, so you can’t access this test.",
    icon: Ban,
    accent:
      "border-orange-500/40 bg-orange-500/5 text-orange-700 dark:text-orange-400",
  },

  ended: {
    title: "Test Window Closed",
    description:
      "This test is no longer available. The allowed time window for attempting it has ended.",
    icon: AlertTriangle,
    accent:
      "border-purple-500/40 bg-purple-500/5 text-purple-700 dark:text-purple-400",
  },

  not_found: {
    title: "Test Not Found",
    description: "This test attempt doesn’t exist or may have been removed.",
    icon: AlertTriangle,
    accent: "border-muted bg-muted/30 text-muted-foreground",
  },
};

export default function AttemptDeniedCard({ reason }: Props) {
  const router = useRouter();

  const config = CONFIG[reason];
  const Icon = config.icon;

  return (
    <div className="flex h-(--h-viewport-minus-navbar) items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-md border shadow-lg ${config.accent}`}>
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <Icon className="h-10 w-10" />
          <h1 className="text-xl font-semibold">{config.title}</h1>
        </CardHeader>

        <CardContent className="space-y-5 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {config.description}
          </p>

          <Button
            className="w-full"
            onClick={() => router.push("/student/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
