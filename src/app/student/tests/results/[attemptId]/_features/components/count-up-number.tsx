"use client";

import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  easeOut,
} from "motion/react";
import { useEffect } from "react";

export function CountUpNumber({
  value,
  start,
  duration = 1.4,
}: {
  value: number;
  start: boolean;
  duration?: number;
}) {
  const motionValue = useMotionValue(0);

  // Detect decimals from input value
  const decimalPlaces = (() => {
    const str = value.toString();
    return str.includes(".") ? str.split(".")[1].length : 0;
  })();

  // Format to same precision as input
  const formatted = useTransform(motionValue, (latest) =>
    latest.toFixed(decimalPlaces),
  );

  useEffect(() => {
    if (!start) return;

    const controls = animate(motionValue, value, {
      duration,
      ease: easeOut,
    });

    return controls.stop;
  }, [start, value, duration, motionValue]);

  return <motion.span>{formatted}</motion.span>;
}
