"use client";

import { motion } from "motion/react";

export function PracticeProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = ((current + 1) / total) * 100;

  return (
    <div className="h-1 w-full overflow-hidden rounded bg-muted">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
