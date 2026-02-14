"use client";

import { motion, easeOut } from "motion/react";
import type { Variants } from "motion/react";
import { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { CountUpNumber } from "./count-up-number";

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
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
        // small delay makes it feel more natural
        setTimeout(() => setStartCount(true), 120);
      }}
    >
      <Card className="h-full rounded-sm shadow-none bg-linear-to-br from-background to-muted/40">
        <CardContent className="p-5 flex h-full flex-col justify-between">
          {/* Top */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center justify-center size-10 rounded-xl ${tone}`}
            >
              {icon}
            </div>

            <p className="text-2xl font-bold tabular-nums">
              <CountUpNumber value={value} start={startCount} />
            </p>
          </div>

          {/* Bottom */}
          <div className="space-y-1 pt-4">
            <p className="text-sm font-medium leading-none">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
