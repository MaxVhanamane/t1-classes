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
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
      {/* Track glow */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Main progress */}
      <motion.div
        className="relative h-full rounded-full bg-linear-to-r from-primary via-primary to-primary"
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 18,
        }}
      >
        {/* Bubble pulse at edge */}
        <motion.div
          key={percent}
          className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/70 blur-[1px]"
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}
