"use client";
import { useState, useEffect, useRef } from "react";
import { motion, type Transition } from "motion/react";

const AnimatedStudent = () => {
  const [phase, setPhase] = useState<
    "running" | "dancing" | "sitting" | "sliding"
  >("running");

  const isDancing = phase === "dancing";
  const isSitting = phase === "sitting";
  const isSliding = phase === "sliding";
  const canClickToSlide = isSitting;

  const danceTransition: Transition = {
    duration: 2,
    times: [0, 0.28, 0.56, 0.8, 1],
    ease: "easeInOut",
  };

  const headPoses = {
    cx: [-2, 2, -2, 0, 0],
    cy: [-13, -13, -13, -16, -14],
  };
  const hairD = headPoses.cx.map(
    (cx, i) =>
      `M ${cx - 2.3},${headPoses.cy[i] - 2.3} Q ${cx},${
        headPoses.cy[i] - 5.5
      } ${cx + 2.3},${headPoses.cy[i] - 2.3}`,
  );
  const neckX = headPoses.cx;
  const neckY = headPoses.cy.map((cy) => cy + 3);

  const pathD = "M-80,0 L0,0 C100,0 150,-60 250,-40 C350,-20 420,-90 500,-100";

  const climbRef = useRef<SVGAnimateMotionElement>(null);
  const slideRef = useRef<SVGAnimateMotionElement>(null);

  useEffect(() => {
    climbRef.current?.beginElement();
  }, []);

  useEffect(() => {
    if (phase === "running") {
      climbRef.current?.beginElement();
      const t = setTimeout(() => setPhase("dancing"), 7000);
      return () => clearTimeout(t);
    }
    if (phase === "dancing") {
      const t = setTimeout(() => setPhase("sitting"), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const handleSlideEnd = () => setPhase("running");
    el.addEventListener("endEvent", handleSlideEnd);
    return () => el.removeEventListener("endEvent", handleSlideEnd);
  }, []);

  const handleSlideClick = () => {
    if (canClickToSlide) {
      setPhase("sliding");
      slideRef.current?.beginElement();
    }
  };

  return (
    <motion.g
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <g transform="translate(0, 120)">
        <g>
          <animateMotion
            ref={climbRef}
            dur="7s"
            begin="indefinite"
            fill="freeze"
            calcMode="linear"
            keyPoints="0;0.93"
            keyTimes="0;1"
            path={pathD}
          />
          <animateMotion
            ref={slideRef}
            dur="3s"
            begin="indefinite"
            fill="freeze"
            calcMode="linear"
            keyPoints="0.93;0"
            keyTimes="0;1"
            path={pathD}
          />

          <motion.g
            initial={{ y: -6, rotate: 10, scale: 1.25 }}
            animate={
              isSitting
                ? { y: 0, rotate: 0, scale: 1.25 }
                : isSliding
                  ? { y: -3, rotate: -18, scale: 1.25 }
                  : isDancing
                    ? {
                        y: [-6, -6, -6, -9, -6],
                        rotate: [-10, 10, -10, 0, 0],
                        scale: 1.25,
                      }
                    : { y: -6, rotate: 10, scale: 1.25 }
            }
            transition={
              isDancing ? danceTransition : { duration: 0.4, ease: "easeOut" }
            }
          >
            {/* Invisible click hit-area */}
            <rect
              x="-10"
              y="-19"
              width="20"
              height="28"
              fill="transparent"
              onClick={handleSlideClick}
              style={{
                cursor: canClickToSlide ? "pointer" : "default",
                pointerEvents: canClickToSlide ? "auto" : "none",
              }}
            />

            {/* Hair */}
            <motion.path
              initial={{ d: "M 0.5,-15 Q 2.5,-17.5 4.5,-13.5" }}
              animate={
                isSitting
                  ? { d: "M -2.5,-12.5 Q 0,-15.5 2.5,-12.5" }
                  : isSliding
                    ? { d: "M 0.5,-14 Q 5,-15 4.5,-9" }
                    : isDancing
                      ? { d: hairD }
                      : { d: "M 0.5,-15 Q 2.5,-17.5 4.5,-13.5" }
              }
              transition={isDancing ? danceTransition : { duration: 0.4 }}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Head */}
            <motion.circle
              initial={{ cx: 2, cy: -14, r: 2.5 }}
              animate={
                isSitting
                  ? { cx: 0, cy: -11.5, r: 2.8 }
                  : isSliding
                    ? { cx: 2, cy: -12.5, r: 2.8 }
                    : isDancing
                      ? { cx: headPoses.cx, cy: headPoses.cy, r: 2.8 }
                      : { cx: 2, cy: -14, r: 2.5 }
              }
              transition={isDancing ? danceTransition : { duration: 0.4 }}
              fill="#94a3b8"
            />

            {/* Backpack (worn) */}
            <motion.rect
              initial={{
                opacity: 0.9,
                x: -4.5,
                y: -10.5,
                width: 4.5,
                height: 5.5,
                rotate: 0,
              }}
              animate={{
                opacity: isSitting || isSliding ? 0 : 0.9,
                x: -4.5,
                y: -10.5,
                width: 4.5,
                height: 5.5,
                rotate: 0,
              }}
              transition={{ duration: 0.4 }}
              rx="1.5"
              fill="#94a3b8"
            />

            {/* Backpack (set down & tumbling behind) */}
            <motion.g
              initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
              animate={
                isSitting
                  ? { opacity: 0.95, x: 0, y: 0, rotate: 0 }
                  : isSliding
                    ? {
                        opacity: [0.95, 0.95, 0.95],
                        x: [12, 16, 12],
                        y: [-4, -10, -4],
                        rotate: [10, -10, 10],
                      }
                    : { opacity: 0, x: 0, y: 0, rotate: 0 }
              }
              transition={
                isSliding
                  ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
                  : { duration: 0.4, delay: isSitting ? 0.2 : 0 }
              }
              transform="translate(0, -8)"
            >
              <rect
                x="9"
                y="0"
                width="5"
                height="4.5"
                rx="0.9"
                fill="#94a3b8"
              />
              <rect
                x="8.8"
                y="-1.2"
                width="5.4"
                height="2"
                rx="1"
                fill="#94a3b8"
              />
              <rect
                x="10"
                y="1.3"
                width="3"
                height="1.8"
                rx="0.5"
                fill="#ffffff"
                opacity="0.25"
              />
              <path
                d="M 10.5,-1.2 Q 11.5,-2.4 12.5,-1.2"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Body Spine / Torso */}
            <motion.line
              initial={{ x1: 0, y1: -11, x2: 0, y2: -4, strokeWidth: 2.5 }}
              animate={
                isSitting
                  ? { x1: 0, y1: -10, x2: 0, y2: -3, strokeWidth: 5.5 }
                  : isSliding
                    ? { x1: 2.5, y1: -9, x2: 0, y2: -2, strokeWidth: 5 }
                    : isDancing
                      ? { x1: neckX, y1: neckY, x2: 0, y2: -3, strokeWidth: 5 }
                      : { x1: 0, y1: -11, x2: 0, y2: -4, strokeWidth: 2.5 }
              }
              transition={isDancing ? danceTransition : { duration: 0.4 }}
              stroke="#94a3b8"
              strokeLinecap="round"
            />

            {/* Left Arm - FIXED: Removed opacity: 0.5 from initial */}
            <motion.line
              initial={{ x1: 0, y1: -10, x2: 4, y2: -6 }}
              animate={
                isSitting
                  ? { x1: -3.5, y1: -8.5, x2: -6.5, y2: -1.5 }
                  : isSliding
                    ? {
                        x1: [2, 2, 2],
                        y1: [-7.5, -7.5, -7.5],
                        x2: [-4, 0, -4],
                        y2: [-14, -18, -14],
                      }
                    : isDancing
                      ? {
                          x1: -2.5,
                          y1: -8.5,
                          x2: [-8, -2, -8, -6, -5],
                          y2: [-16, -6, -16, -16, -4],
                        }
                      : {
                          x1: 0,
                          y1: -10,
                          x2: [4, 0, -4, 0, 4],
                          y2: [-6, -4, -6, -4, -6],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "linear" }
              }
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Right Arm */}
            <motion.line
              initial={{ x1: 0, y1: -10, x2: -4, y2: -6 }}
              animate={
                isSitting
                  ? { x1: 3.5, y1: -8.5, x2: 6.5, y2: -1.5 }
                  : isSliding
                    ? {
                        x1: [3, 3, 3],
                        y1: [-7.5, -7.5, -7.5],
                        x2: [-1, 3, -1],
                        y2: [-17, -13, -17],
                      }
                    : isDancing
                      ? {
                          x1: 2.5,
                          y1: -8.5,
                          x2: [2, 8, 2, 6, 5],
                          y2: [-6, -16, -6, -16, -4],
                        }
                      : {
                          x1: 0,
                          y1: -10,
                          x2: [-4, 0, 4, 0, -4],
                          y2: [-6, -4, -6, -4, -6],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "linear" }
              }
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Left Leg (Thigh) */}
            <motion.line
              initial={{ x1: 0, y1: -4, x2: 2, y2: 0 }}
              animate={
                isSitting
                  ? { x1: -1.5, y1: -3, x2: -6.5, y2: -0.5 }
                  : isSliding
                    ? {
                        x1: [-0.5, -0.5, -0.5],
                        y1: [-2, -2, -2],
                        x2: [-5, -3, -5],
                        y2: [-6, -3, -6],
                      }
                    : isDancing
                      ? {
                          x1: 0,
                          y1: -3,
                          x2: [-2.5, -1, -2.5, -0.5, -1],
                          y2: [1, -1.5, 1, 1.5, 1],
                        }
                      : {
                          x1: 0,
                          y1: -4,
                          x2: [2, 0, -2, 0, 2],
                          y2: [0, 1, 0, -1, 0],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              }
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left Leg (Calf) */}
            <motion.line
              initial={{ opacity: 1, x1: 2, y1: 0, x2: 3, y2: 4 }}
              animate={
                isSitting
                  ? { opacity: 1, x1: -6.5, y1: -0.5, x2: -6.5, y2: 4.5 }
                  : isSliding
                    ? {
                        opacity: [1, 1, 1],
                        x1: [-5, -3, -5],
                        y1: [-6, -3, -6],
                        x2: [-11, -8, -11],
                        y2: [-2, 0, -2],
                      }
                    : isDancing
                      ? {
                          opacity: 1,
                          x1: [-2.5, -1, -2.5, -0.5, -1],
                          y1: [1, -1.5, 1, 1.5, 1],
                          x2: [-3, -2, -3, -1, -1.5],
                          y2: [4.5, 3, 4.5, 5.5, 4.5],
                        }
                      : {
                          opacity: 1,
                          x1: [2, 0, -2, 0, 2],
                          y1: [0, 1, 0, -1, 0],
                          x2: [3, 0, -3, 0, 3],
                          y2: [4, 5, 4, 1, 4],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              }
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left Foot (Shoe) */}
            <motion.line
              initial={{ opacity: 0, x1: 0, y1: -4, x2: 0, y2: -4 }}
              animate={
                isSitting
                  ? { opacity: 1, x1: -6.5, y1: 4.5, x2: -8, y2: 4.5 }
                  : isSliding
                    ? {
                        opacity: [1, 1, 1],
                        x1: [-11, -8, -11],
                        y1: [-2, 0, -2],
                        x2: [-12.5, -9.5, -12.5],
                        y2: [-3.5, -1.5, -3.5],
                      }
                    : { opacity: 0, x1: 0, y1: -4, x2: 0, y2: -4 }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
                    : { duration: 0.4 }
              }
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Right Leg (Thigh) */}
            <motion.line
              initial={{ x1: 0, y1: -4, x2: -2, y2: 0 }}
              animate={
                isSitting
                  ? { x1: 1.5, y1: -3, x2: 6.5, y2: -0.5 }
                  : isSliding
                    ? {
                        x1: [0.5, 0.5, 0.5],
                        y1: [-2, -2, -2],
                        x2: [-2, -4, -2],
                        y2: [-1, -4, -1],
                      }
                    : isDancing
                      ? {
                          x1: 0,
                          y1: -3,
                          x2: [0.5, 2.5, 0.5, 0.5, 1],
                          y2: [1.5, 1, 1.5, -1.5, 1],
                        }
                      : {
                          x1: 0,
                          y1: -4,
                          x2: [-2, 0, 2, 0, -2],
                          y2: [0, -1, 0, 1, 0],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              }
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right Leg (Calf) */}
            <motion.line
              initial={{ opacity: 1, x1: -2, y1: 0, x2: -3, y2: 4 }}
              animate={
                isSitting
                  ? { opacity: 1, x1: 6.5, y1: -0.5, x2: 6.5, y2: 4.5 }
                  : isSliding
                    ? {
                        opacity: [1, 1, 1],
                        x1: [-2, -4, -2],
                        y1: [-1, -4, -1],
                        x2: [-6, -9, -6],
                        y2: [1, -1, 1],
                      }
                    : isDancing
                      ? {
                          opacity: 1,
                          x1: [0.5, 2.5, 0.5, 0.5, 1],
                          y1: [1.5, 1, 1.5, -1.5, 1],
                          x2: [1, 3, 1, 1.5, 1.5],
                          y2: [5.5, 4.5, 5.5, 3, 4.5],
                        }
                      : {
                          opacity: 1,
                          x1: [-2, 0, 2, 0, -2],
                          y1: [0, -1, 0, 1, 0],
                          x2: [-3, 0, 3, 0, -3],
                          y2: [4, 1, 4, 5, 4],
                        }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
                    : isDancing
                      ? danceTransition
                      : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              }
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right Foot (Shoe) */}
            <motion.line
              initial={{ opacity: 0, x1: 0, y1: -4, x2: 0, y2: -4 }}
              animate={
                isSitting
                  ? { opacity: 1, x1: 6.5, y1: 4.5, x2: 8, y2: 4.5 }
                  : isSliding
                    ? {
                        opacity: [1, 1, 1],
                        x1: [-6, -9, -6],
                        y1: [1, -1, 1],
                        x2: [-7.5, -10.5, -7.5],
                        y2: [-0.5, -2.5, -0.5],
                      }
                    : { opacity: 0, x1: 0, y1: -4, x2: 0, y2: -4 }
              }
              transition={
                isSitting
                  ? { duration: 0.4 }
                  : isSliding
                    ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
                    : { duration: 0.4 }
              }
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      </g>
    </motion.g>
  );
};

export default AnimatedStudent;
