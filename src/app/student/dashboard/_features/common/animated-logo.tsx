"use client";

import { motion } from "motion/react";

export function AnimatedLogo() {
  const pathD = `
    M210 0

    Q198 0 190 14

    L18 312

    Q0 344 30 344

    L148 344

    Q162 344 162 330

    L162 278

    Q162 262 178 262

    L242 262

    Q258 262 258 278

    L258 330

    Q258 344 272 344

    L390 344

    Q420 344 402 312

    L230 14

    Q222 0 210 0

    Z
  `;

  return (
    <motion.svg
      viewBox="0 0 420 360"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Draw */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.3,
          ease: [0.65, 0, 0.35, 1],
        }}
      />

      {/* Fill */}
      <motion.path
        d={pathD}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.1,
          duration: 0.4,
        }}
      />
    </motion.svg>
  );
}
