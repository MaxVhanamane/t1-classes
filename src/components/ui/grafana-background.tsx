"use client";

import { cn } from "@/src/lib/utils";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  opacity?: number;
  color?: string;
  animated?: boolean;
};

export function GrafanaBackground({
  className,
  opacity = 1,
  color,
  animated = true,
}: Props) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden m-0 z-0",
        className,
      )}
      style={{ opacity }}
    >
      {/* LIGHT MODE */}
      <svg
        viewBox="0 0 1201 427"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full dark:hidden"
      >
        <defs>
          <filter id="glow-light" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath="url(#clip0_933_1200)">
          {/* Grid lines — use color prop if provided */}
          <line
            x1="193.511"
            y1="0.71875"
            x2="193.511"
            y2="427"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="468.511"
            y1="0.71875"
            x2="468.511"
            y2="427"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="743.511"
            y1="0.71875"
            x2="743.511"
            y2="427"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="1018.51"
            y1="0.71875"
            x2="1018.51"
            y2="427"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="1200.61"
            y1="95.3333"
            x2="0.607422"
            y2="95.3332"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="1200.61"
            y1="214"
            x2="0.607422"
            y2="214"
            stroke={color ?? "#DFDFDF"}
          />
          <line
            x1="1200.61"
            y1="332.667"
            x2="0.607422"
            y2="332.667"
            stroke={color ?? "#DFDFDF"}
          />

          <g opacity="0.3">
            <path
              opacity="0.1"
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              fill={"#EDEDED"}
              stroke={color ?? "#D4D4D4"}
            />
            <path
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              stroke={color ?? "#D4D4D4"}
            />
            <circle
              cx="193.48"
              cy="152.58"
              r="5.03125"
              fill={color ?? "#D4D4D4"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="468.178"
              cy="264.26"
              r="5.03125"
              fill={color ?? "#D4D4D4"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="742.888"
              cy="109.857"
              r="5.03125"
              fill={color ?? "#D4D4D4"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="1018.6"
              cy="370.473"
              r="5.03125"
              fill={color ?? "#D4D4D4"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
          </g>

          <g opacity="0.5">
            <path
              opacity="0.1"
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              fill={"#EDEDED"}
              stroke={color ?? "#D4D4D4"}
            />
            <path
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              stroke={color ?? "#D4D4D4"}
            />
          </g>
        </g>

        <defs>
          <clipPath id="clip0_933_1200">
            <rect
              width="1200"
              height="427"
              fill="white"
              transform="translate(0.607422)"
            />
          </clipPath>
        </defs>

        {animated && (
          <>
            <MovingDot
              pathRef={path1Ref}
              duration={20}
              delay={0}
              filter="url(#glow-light)"
            />
            <MovingDot
              pathRef={path2Ref}
              duration={20}
              delay={10}
              reverse
              filter="url(#glow-light)"
            />
          </>
        )}
      </svg>

      {/* DARK MODE */}
      <svg
        viewBox="0 0 1201 427"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full hidden dark:block"
      >
        <defs>
          <filter
            id="glow-dark"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />

            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1.8 0"
              result="glow"
            />

            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath="url(#clip0_dark)">
          {/* Grid lines */}
          <line
            x1="193.511"
            y1="0"
            x2="193.511"
            y2="427"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="468.511"
            y1="0"
            x2="468.511"
            y2="427"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="743.511"
            y1="0"
            x2="743.511"
            y2="427"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="1018.51"
            y1="0"
            x2="1018.51"
            y2="427"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="0"
            y1="95.3333"
            x2="1200"
            y2="95.3333"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="0"
            y1="214"
            x2="1200"
            y2="214"
            stroke={color ?? "#2A2A2A"}
          />
          <line
            x1="0"
            y1="332.667"
            x2="1200"
            y2="332.667"
            stroke={color ?? "#2A2A2A"}
          />

          <g opacity="0.4">
            <path
              opacity="0.15"
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              fill={"#1E1E1E"}
              stroke={color ?? "#3A3A3A"}
            />
            <path
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              stroke={color ?? "#3A3A3A"}
            />
            <circle
              cx="193.48"
              cy="152.58"
              r="5.03125"
              fill={color ?? "#4A4A4A"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="468.178"
              cy="264.26"
              r="5.03125"
              fill={color ?? "#4A4A4A"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="742.888"
              cy="109.857"
              r="5.03125"
              fill={color ?? "#4A4A4A"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
            <circle
              cx="1018.6"
              cy="370.473"
              r="5.03125"
              fill={color ?? "#4A4A4A"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: "scale(0.7)",
              }}
            />
          </g>

          <g opacity="0.6">
            <path
              opacity="0.15"
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              fill={"#1E1E1E"}
              stroke={color ?? "#3A3A3A"}
            />
            <path
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              stroke={color ?? "#3A3A3A"}
            />
          </g>

          {/* Curve 1 */}
          <path
            ref={path1Ref}
            d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
            fill="none"
          />

          {/* Curve 2 */}
          <path
            ref={path2Ref}
            d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
            fill="none"
          />

          {animated && (
            <>
              {" "}
              {/* Dot 1 → LEFT → RIGHT */}
              <MovingDot
                pathRef={path1Ref}
                duration={20}
                delay={0}
                filter="url(#glow-dark)"
              />
              {/* Dot 2 → RIGHT → LEFT (delayed) */}
              <MovingDot
                pathRef={path2Ref}
                duration={20}
                delay={10}
                reverse
                filter="url(#glow-dark)"
              />
            </>
          )}
        </g>

        <defs>
          <clipPath id="clip0_dark">
            <rect width="1200" height="427" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

type MovingDotProps = {
  pathRef: React.RefObject<SVGPathElement | null>;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  color?: string;
  animated?: boolean;
  filter?: string;
};

export function MovingDot({
  pathRef,
  duration = 20,
  delay = 0,
  reverse = false,
  color,
  animated = true,
  filter,
}: MovingDotProps) {
  const progress = useMotionValue(0);

  const x = useTransform(progress, (v) => {
    const path = pathRef.current;
    if (!path) return 0;

    const length = path.getTotalLength();
    const point = path.getPointAtLength(reverse ? length - v : v);
    return point.x;
  });

  const y = useTransform(progress, (v) => {
    const path = pathRef.current;
    if (!path) return 0;

    const length = path.getTotalLength();
    const point = path.getPointAtLength(reverse ? length - v : v);
    return point.y;
  });

  useEffect(() => {
    if (!animated) return;

    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    let controls: AnimationPlaybackControls | undefined;

    const start = () => {
      progress.set(0);

      controls = animate(progress, length, {
        duration,
        ease: "linear",
        repeat: Infinity,
      });
    };

    const timeout = setTimeout(start, delay * 1000);

    return () => {
      clearTimeout(timeout);
      controls?.stop();
    };
  }, [animated, pathRef, duration, delay, reverse, progress]);

  if (!animated) return null;

  return (
    <motion.circle
      r="5"
      fill={color ?? "#D4D4D4"}
      style={{ cx: x, cy: y }}
      filter={filter}
    />
  );
}
