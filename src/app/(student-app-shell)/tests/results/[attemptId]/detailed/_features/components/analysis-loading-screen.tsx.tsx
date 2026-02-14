"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const messages = [
  "Reviewing your test responses…",
  "Calculating your total score…",
  "Measuring your overall accuracy…",
  "Reviewing correct and incorrect answers…",
  "Identifying unanswered questions…",
  "Finalizing your result analysis…",
];

export function AnalysisLoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-(--h-viewport-minus-navbar) w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Spinner */}
        <div className="relative">
          <Loader className=" animate-spin text-primary" />

          {/* Soft glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        </div>

        {/* Changing text */}
        <div className="h-5">
          <p
            key={index}
            className="text-sm text-muted-foreground animate-in fade-in duration-300"
          >
            {messages[index]}
          </p>
        </div>
      </div>
    </div>
  );
}
