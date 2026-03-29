import { motion } from "motion/react";

export function AnimatedLogo() {
  const pathD = `
    M210 0
    L420 364
    L254 364
    L254 309
    L166 309
    L166 364
    L0 364
    Z
  `;

  return (
    <motion.svg
      viewBox="0 0 420 380"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Uniform scale + center */}
      <motion.g transform="scale(0.85) translate(37, 20)">
        {/* Stroke */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
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
          className="dark:fill-white fill-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        />
      </motion.g>
    </motion.svg>
  );
}
