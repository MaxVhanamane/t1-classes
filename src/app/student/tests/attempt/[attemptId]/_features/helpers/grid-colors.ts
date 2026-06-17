import { GridState } from "../types/grid.types";

export function getGridClasses(state: GridState) {
  const base = `
    relative
    rounded-md
    border
    transition-all duration-150 ease-out
    hover:shadow-sm
    active:scale-[0.97]
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
  `;

  switch (state) {
    case "answered":
      return `${base}
        bg-green-200
        text-green-900
        border-green-500

        dark:bg-green-500/10
        dark:text-foreground
        dark:border-green-500/40
      `;

    case "review":
      return `${base}
        bg-fuchsia-200
        text-fuchsia-900
        border-fuchsia-500

        dark:bg-purple-500/10
        dark:text-foreground
        dark:border-purple-500/40
      `;

    case "answered_review":
      return `${base}
        bg-blue-200
        text-blue-900
        border-blue-500

        dark:bg-blue-500/10
        dark:text-foreground
        dark:border-blue-500/40
      `;

    case "not_answered":
      return `${base}
        bg-orange-200
        text-orange-900
        border-orange-500

        dark:bg-yellow-500/10
        dark:text-foreground
        dark:border-yellow-500/40
      `;

    case "not_visited":
    default:
      return `${base}
        bg-slate-100
        text-slate-700
        border-slate-300

        dark:bg-muted
        dark:text-foreground
        dark:border-border
      `;
  }
}
