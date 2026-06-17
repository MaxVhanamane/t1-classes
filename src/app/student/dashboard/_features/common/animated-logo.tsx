"use client";

import { motion } from "motion/react";

export function AnimatedLogo() {
  const mainPath =
    "M629 314 L298 897 L561 897 L648 749 L540 747 L600 646 L817 646 Z";

  const rightPath = "M700 896 L966 897 L880 748 L788 748 Z";

  return (
    <motion.svg
      viewBox="298 314 668 583"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Main shape outline */}
      <motion.path
        d={mainPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.65, 0, 0.35, 1],
        }}
      />

      {/* Right piece outline */}
      <motion.path
        d={rightPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.25,
          ease: [0.65, 0, 0.35, 1],
        }}
      />

      {/* Main fill */}
      <motion.path
        d={mainPath}
        className="fill-current"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.9,
          duration: 0.35,
        }}
      />

      {/* Right fill */}
      <motion.path
        d={rightPath}
        className="fill-current"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.0,
          duration: 0.35,
        }}
      />
    </motion.svg>
  );
}
