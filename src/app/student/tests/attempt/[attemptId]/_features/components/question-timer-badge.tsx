"use client";

import { useEffect, useState } from "react";

import { QuestionTimer } from "../hooks/use-question-time-tracker";
import { secondsToDurationString } from "@/src/lib/helper-functions/seconds-to-duration-string";

type Props = {
  timer: QuestionTimer;
  serverTimeSeconds: number;
};

export function QuestionTimerBadge({ timer, serverTimeSeconds }: Props) {
  const [seconds, setSeconds] = useState(serverTimeSeconds);

  useEffect(() => {
    const update = () => {
      setSeconds(serverTimeSeconds + timer.getCurrentQuestionSeconds());
    };

    update();

    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [timer, serverTimeSeconds]);

  const hasHours = seconds >= 3600;

  return (
    <div
      className={`flex ${
        hasHours ? "w-24" : "w-18"
      } items-center justify-center rounded-full border bg-card  py-1 text-xs font-mono tabular-nums`}
    >
      {secondsToDurationString(seconds)}
    </div>
  );
}
