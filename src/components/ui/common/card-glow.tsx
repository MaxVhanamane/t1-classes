import { cn } from "@/src/lib/utils";

export type GlowColor =
  | "cyan"
  | "emerald"
  | "yellow"
  | "pink"
  | "purple"
  | "indigo"
  | "teal"
  | "gray"
  | "blue"
  | "red"
  | "orange"
  | "amber"
  | "lime"
  | "green"
  | "sky"
  | "violet"
  | "fuchsia"
  | "rose";

interface CardGlowProps {
  color?: GlowColor;
  className?: string;
  hideLightGlow?: boolean; // New prop
}

const LIGHT_GRADIENTS: Record<GlowColor, string> = {
  cyan: "from-cyan-500/15 to-cyan-500/5",
  emerald: "from-emerald-500/15 to-emerald-500/5",
  yellow: "from-yellow-500/15 to-yellow-500/5",
  pink: "from-pink-500/15 to-pink-500/5",
  purple: "from-purple-500/15 to-purple-500/5",
  indigo: "from-indigo-500/15 to-indigo-500/5",
  teal: "from-teal-500/15 to-teal-500/5",
  gray: "from-gray-500/10 to-gray-500/5",
  blue: "from-blue-500/15 to-blue-500/5",
  red: "from-red-500/15 to-red-500/5",
  orange: "from-orange-500/15 to-orange-500/5",
  amber: "from-amber-500/15 to-amber-500/5",
  lime: "from-lime-500/15 to-lime-500/5",
  green: "from-green-500/15 to-green-500/5",
  sky: "from-sky-500/15 to-sky-500/5",
  violet: "from-violet-500/15 to-violet-500/5",
  fuchsia: "from-fuchsia-500/15 to-fuchsia-500/5",
  rose: "from-rose-500/15 to-rose-500/5",
};

const DARK_TOP_GLOWS: Record<GlowColor, string> = {
  cyan: "bg-linear-to-b from-cyan-300/50 via-cyan-300/5 to-transparent",
  emerald:
    "bg-linear-to-b from-emerald-400/40 via-emerald-300/5 to-transparent",
  yellow: "bg-linear-to-b from-yellow-400/40 via-yellow-300/5 to-transparent",
  pink: "bg-linear-to-b from-pink-400/40 via-pink-300/5 to-transparent",
  purple: "bg-linear-to-b from-purple-400/40 via-purple-300/5 to-transparent",
  indigo: "bg-linear-to-b from-indigo-400/40 via-indigo-300/5 to-transparent",
  teal: "bg-linear-to-b from-teal-400/40 via-teal-300/5 to-transparent",
  gray: "bg-linear-to-b from-gray-400/20 via-gray-300/5 to-transparent",
  blue: "bg-linear-to-b from-blue-400/40 via-blue-300/5 to-transparent",
  red: "bg-linear-to-b from-red-400/40 via-red-300/5 to-transparent",
  orange: "bg-linear-to-b from-orange-400/40 via-orange-300/5 to-transparent",
  amber: "bg-linear-to-b from-amber-400/40 via-amber-300/5 to-transparent",
  lime: "bg-linear-to-b from-lime-400/40 via-lime-300/5 to-transparent",
  green: "bg-linear-to-b from-green-400/40 via-green-300/5 to-transparent",
  sky: "bg-linear-to-b from-sky-400/40 via-sky-300/5 to-transparent",
  violet: "bg-linear-to-b from-violet-400/40 via-violet-300/5 to-transparent",
  fuchsia:
    "bg-linear-to-b from-fuchsia-400/40 via-fuchsia-300/5 to-transparent",
  rose: "bg-linear-to-b from-rose-400/40 via-rose-300/5 to-transparent",
};

const DARK_RINGS: Record<GlowColor, string> = {
  cyan: "dark:ring-cyan-300/15",
  emerald: "dark:ring-emerald-300/15",
  yellow: "dark:ring-yellow-300/15",
  pink: "dark:ring-pink-300/15",
  purple: "dark:ring-purple-300/15",
  indigo: "dark:ring-indigo-300/15",
  teal: "dark:ring-teal-300/15",
  gray: "dark:ring-gray-300/10",
  blue: "dark:ring-blue-300/15",
  red: "dark:ring-red-300/15",
  orange: "dark:ring-orange-300/15",
  amber: "dark:ring-amber-300/15",
  lime: "dark:ring-lime-300/15",
  green: "dark:ring-green-300/15",
  sky: "dark:ring-sky-300/15",
  violet: "dark:ring-violet-300/15",
  fuchsia: "dark:ring-fuchsia-300/15",
  rose: "dark:ring-rose-300/15",
};

export function CardGlow({
  color = "cyan",
  className,
  hideLightGlow = false,
}: CardGlowProps) {
  return (
    <>
      {/* TOP GLOW (Conditional: shown in both modes if hideLightGlow is true, otherwise dark-only) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 blur-2xl",
          hideLightGlow ? "block" : "hidden dark:block",
          DARK_TOP_GLOWS[color],
        )}
      />

      {/* BORDER GLOW */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl dark:ring-1 dark:ring-inset",
          DARK_RINGS[color],
          className,
        )}
      />

      {/* LIGHT MODE GRADIENT (Skipped if hideLightGlow is true) */}
      {!hideLightGlow && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-linear-to-br dark:hidden",
            LIGHT_GRADIENTS[color],
            className,
          )}
        />
      )}
    </>
  );
}
