"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { cn } from "@/src/lib/utils";

// two multi-bend traces run the side margins (never cross the x:28-72
// center column where logo/headline/fields sit), plus one curved
// flourish sweeping the top margin behind the logo. All start and end
// outside the viewBox so the spark is always edge-to-edge, never mid-card.
const TRACE_PATHS = [
  "M -5 38 H 14 V 58 H 24 V 105",
  "M 105 68 H 88 V 42 H 76 V -5",
  "M -5 18 C 18 -6, 42 28, 68 -2 S 98 20, 105 6",
];

const SPEED = 12;
const GAP = 0.6;

function pointAt(path: SVGPathElement, frac: number, dir: 1 | -1) {
  const len = path.getTotalLength();
  return path.getPointAtLength(dir === 1 ? frac * len : (1 - frac) * len);
}

export function PremiumLines({ className }: { className?: string }) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const state = useRef({
    index: 0,
    dir: 1 as 1 | -1,
    t: 0,
    phase: "travel" as "travel" | "gap",
  });
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const opacity = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    const dt = delta / 1000;
    const s = state.current;
    const path = pathRefs.current[s.index];
    if (!path) return;
    const length = path.getTotalLength();
    const duration = length / SPEED;

    if (s.phase === "travel") {
      s.t += dt;
      const progress = Math.min(s.t / duration, 1);
      const point = pointAt(path, progress, s.dir);
      cx.set(point.x);
      cy.set(point.y);

      let o = 1;
      if (progress < 0.08) o = progress / 0.08;
      else if (progress > 0.92) o = (1 - progress) / 0.08;
      opacity.set(o);

      if (progress >= 1) {
        s.phase = "gap";
        s.t = 0;
      }
    } else {
      s.t += dt;
      if (s.t >= GAP) {
        // find whichever OTHER trace has an endpoint nearest to where
        // the spark just exited, and enter from there, in whichever
        // direction makes that endpoint the starting point
        const exit = { x: cx.get(), y: cy.get() };
        let best = { dist: Infinity, index: s.index, dir: 1 as 1 | -1 };

        pathRefs.current.forEach((p, i) => {
          if (!p || i === s.index) return;
          (["start", "end"] as const).forEach((which) => {
            const dir: 1 | -1 = which === "start" ? 1 : -1;
            const pt = pointAt(p, 0, dir);
            const d = Math.hypot(pt.x - exit.x, pt.y - exit.y);
            if (d < best.dist) best = { dist: d, index: i, dir };
          });
        });

        s.index = best.index;
        s.dir = best.dir;
        s.phase = "travel";
        s.t = 0;
      }
    }
  });

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <filter
            id="spark-glow"
            x="-300%"
            y="-300%"
            width="700%"
            height="700%"
          >
            <feGaussianBlur stdDeviation="1.5" result="blur" />
          </filter>
        </defs>

        {TRACE_PATHS.map((d, i) => (
          <path
            key={d}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={d}
            stroke="var(--border)"
            strokeWidth="0.35"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <motion.circle
          style={{ cx, cy, opacity }}
          r="1.4"
          fill="var(--foreground)"
          filter="url(#spark-glow)"
          opacity="0.4"
        />
        <motion.circle
          style={{ cx, cy, opacity }}
          r="0.45"
          fill="var(--foreground)"
        />
      </svg>
    </div>
  );
}
