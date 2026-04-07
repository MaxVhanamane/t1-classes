"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Particle = {
  left: number;
  delay: number;
  duration: number;
};

export function GravityConfetti() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 14 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.2 + Math.random() * 0.6,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 1, 0], y: 120 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{ left: `${p.left}%` }}
          className="absolute top-0 h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
        />
      ))}
    </div>
  );
}
