"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Play, Lock, Loader2 } from "lucide-react";
import { INSTRUCTION_COPY } from "../helpers/copy";
import { useRouter } from "nextjs-toploader/app";

type StartResponse =
  | {
      kind: "started" | "resumed";
      attemptId: string;
    }
  | {
      kind: "denied";
      reason: string;
    };

type Props = {
  distributionId: string;
  disabled: boolean;
};

export default function StartGate({ distributionId, disabled }: Props) {
  const [checked, setChecked] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const startMutation = useMutation({
    mutationFn: async (): Promise<StartResponse> => {
      const res = await fetch(
        `/api/tests/distributions/${distributionId}/start`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.reason || "Failed to start test");
      }

      return data;
    },

    onSuccess: (data) => {
      if (data.kind === "denied") {
        toast.error("Cannot start test", {
          description: data.reason.replaceAll("_", " "),
        });
        return;
      }

      toast.success(
        data.kind === "resumed" ? "Resuming your test" : "Test started",
      );

      // Lock UI until route changes
      setIsNavigating(true);
      router.replace(`/student/tests/attempt/${data.attemptId}`);
    },

    onError: (err: Error) => {
      toast.error("Failed to start test", {
        description: err.message,
      });
    },
  });

  const isLocked =
    disabled || !checked || startMutation.isPending || isNavigating;

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground min-w-0">
        <Checkbox
          id="instructions"
          checked={checked}
          onCheckedChange={(v) => setChecked(Boolean(v))}
          disabled={isNavigating || startMutation.isPending}
          className="shrink-0"
        />

        <label
          htmlFor="instructions"
          className="cursor-pointer select-none leading-snug wrap-break-word"
        >
          {INSTRUCTION_COPY.startGate.checkbox}
        </label>
      </div>

      {/* Right */}
      <div className="flex justify-end shrink-0">
        {disabled ? (
          <Button
            disabled
            className="min-w-35 flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {INSTRUCTION_COPY.startGate.locked}
          </Button>
        ) : (
          <Button
            disabled={isLocked}
            onClick={() => startMutation.mutate()}
            className="min-w-35 flex items-center justify-center gap-2"
          >
            {startMutation.isPending || isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}

            {!isNavigating ? INSTRUCTION_COPY.startGate.start : "Starting..."}
          </Button>
        )}
      </div>
    </div>
  );
}
