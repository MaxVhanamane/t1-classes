import { motion } from "motion/react";

export function AnimatedLogo() {
  return (
    <motion.svg
      viewBox="0 0 420 380"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <motion.path
        d="
      M175 350
      L175 290
      L245 290
      L245 350
      L360 350
      Q385 345 380 330
      L240 90
      Q225 60 210 30
      Q195 60 180 90
      L40 330
      Q35 345 60 350
      Z
    "
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.3,
          ease: [0.65, 0, 0.35, 1],
        }}
      />

      {/* Fill fade after draw */}
      <motion.path
        d="
      M175 350
      L175 290
      L245 290
      L245 350
      L360 350
      Q385 345 380 330
      L240 90
      Q225 60 210 30
      Q195 60 180 90
      L40 330
      Q35 345 60 350
      Z
    "
        className="dark:fill-white fill-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      />
    </motion.svg>
  );
}
