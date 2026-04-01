"use client";
import { motion } from "motion/react";

export function GlowOrb({ color = "cyan" }) {
  const glow =
    color === "purple"
      ? "rgba(168,85,247,0.35)"
      : color === "emerald"
        ? "rgba(16,185,129,0.35)"
        : "rgba(34,211,238,0.35)"; // default cyan

  return (
    <motion.div
      className="pointer-events-none absolute w-40 h-40 rounded-full blur-3xl"
      style={{
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
      }}
      animate={{
        x: [0, 60, -40, 20, 0],
        y: [0, -30, 40, -20, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
