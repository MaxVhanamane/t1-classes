"use client";

import { cn } from "@/src/lib/utils";

type Props = {
  className?: string;
  opacity?: number;
  negativeZIndex?: true;
};

export function GrafanaBackground({
  className,
  negativeZIndex,
  opacity = 1,
}: Props) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden m-0 ",
        className,
        negativeZIndex ? "-z-50" : "",
      )}
      style={{ opacity }}
    >
      {/* LIGHT MODE (EXACT SVG) */}
      <svg
        viewBox="0 0 1201 427"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full dark:hidden"
      >
        <g clipPath="url(#clip0_933_1200)">
          <line
            x1="193.511"
            y1="0.71875"
            x2="193.511"
            y2="427"
            stroke="#DFDFDF"
          />
          <line
            x1="468.511"
            y1="0.71875"
            x2="468.511"
            y2="427"
            stroke="#DFDFDF"
          />
          <line
            x1="743.511"
            y1="0.71875"
            x2="743.511"
            y2="427"
            stroke="#DFDFDF"
          />
          <line
            x1="1018.51"
            y1="0.71875"
            x2="1018.51"
            y2="427"
            stroke="#DFDFDF"
          />

          <line
            x1="1200.61"
            y1="95.3333"
            x2="0.607422"
            y2="95.3332"
            stroke="#DFDFDF"
          />
          <line x1="1200.61" y1="214" x2="0.607422" y2="214" stroke="#DFDFDF" />
          <line
            x1="1200.61"
            y1="332.667"
            x2="0.607422"
            y2="332.667"
            stroke="#DFDFDF"
          />

          <g opacity="0.3">
            <path
              opacity="0.1"
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              fill="#EDEDED"
              stroke="#D4D4D4"
            />
            <path
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              stroke="#D4D4D4"
            />
            <circle
              cx="193.48"
              cy="152.58"
              r="5.03125"
              fill="#D4D4D4"
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
              fill="#D4D4D4"
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
              fill="#D4D4D4"
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
              fill="#D4D4D4"
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
              fill="#EDEDED"
              stroke="#D4D4D4"
            />
            <path
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              stroke="#D4D4D4"
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
      </svg>

      {/* DARK MODE (EXACT SVG) */}
      <svg
        viewBox="0 0 1201 427"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full hidden dark:block"
      >
        <g clipPath="url(#clip0_dark)">
          <line x1="193.511" y1="0" x2="193.511" y2="427" stroke="#2A2A2A" />
          <line x1="468.511" y1="0" x2="468.511" y2="427" stroke="#2A2A2A" />
          <line x1="743.511" y1="0" x2="743.511" y2="427" stroke="#2A2A2A" />
          <line x1="1018.51" y1="0" x2="1018.51" y2="427" stroke="#2A2A2A" />

          <line x1="0" y1="95.3333" x2="1200" y2="95.3333" stroke="#2A2A2A" />
          <line x1="0" y1="214" x2="1200" y2="214" stroke="#2A2A2A" />
          <line x1="0" y1="332.667" x2="1200" y2="332.667" stroke="#2A2A2A" />

          <g opacity="0.4">
            <path
              opacity="0.15"
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              fill="#1E1E1E"
              stroke="#3A3A3A"
            />
            <path
              d="M194.652 151.408C33.4075 151.408 29.6578 273.279 -92.2126 295.778L-60.3389 565.768L1268.99 623.891L1287.74 460.772C1246.49 455.772 1135.12 430.773 1019.62 370.775C875.252 295.778 886.501 110.16 740.257 110.16C594.012 110.16 640.885 263.904 470.266 263.904C299.648 263.904 355.896 151.408 194.652 151.408Z"
              stroke="#3A3A3A"
            />
            <circle
              cx="193.48"
              cy="152.58"
              r="5.03125"
              fill="#4A4A4A"
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
              fill="#4A4A4A"
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
              fill="#4A4A4A"
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
              fill="#4A4A4A"
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
              fill="#1E1E1E"
              stroke="#3A3A3A"
            />
            <path
              d="M479.9 156.007C352.248 158.639 203.539 391.572 119.315 442.896L1239.23 482.376C1246.69 402.1 1257.13 240.231 1239.23 234.967C1216.86 228.387 1127.37 188.907 1019.46 188.907C911.549 188.907 885.229 216.543 741.785 216.543C598.34 216.543 607.552 153.375 479.9 156.007Z"
              stroke="#3A3A3A"
            />
          </g>
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
