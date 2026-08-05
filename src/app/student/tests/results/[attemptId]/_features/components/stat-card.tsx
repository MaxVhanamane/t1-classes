"use client";

import { motion, easeOut } from "motion/react";
import type { Variants } from "motion/react";
import { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { CountUpNumber } from "./count-up-number";
import DottedBackground from "@/src/components/dotted-background";
import { cn } from "@/src/lib/utils";

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: easeOut,
    },
  },
};

export function StatCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  tone: string;
}) {
  const [startCount, setStartCount] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="h-full"
      onAnimationComplete={() => {
        setTimeout(() => setStartCount(true), 140);
      }}
    >
      <Card
        className="
          group relative py-4 h-full overflow-hidden rounded-sm
          border border-border/60
          bg-background/80 backdrop-blur-xl"
      >
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />

        {/* subtle texture */}
        <DottedBackground className="opacity-[0.35]" />

        {/* premium radial highlight */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%)]" />

        <CardContent className="relative z-10 flex h-full flex-col justify-between p-4">
          {/* top */}
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-sm",
                "border border-border/60",
                "bg-background/95",
                tone,
              )}
            >
              <div className="opacity-90">{icon}</div>
            </div>
            {/* changed this block */}
            <div className="flex  flex-col items-center justify-center text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Total
              </p>

              <p className="mt-1 w-full text-center text-3xl font-semibold tracking-tight tabular-nums">
                <CountUpNumber value={value} start={startCount} />
              </p>
            </div>
          </div>

          {/* bottom */}
          <div className="pt-7">
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
