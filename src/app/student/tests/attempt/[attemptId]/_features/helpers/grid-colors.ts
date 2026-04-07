import { GridState } from "../types/grid.types"

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
        bg-green-500/10
        text-green-700 dark:text-green-400
        border-green-500/40
      `;

        case "review":
            return `${base}
        bg-purple-500/10
        text-purple-700 dark:text-purple-400
        border-purple-500/40
      `;

        case "answered_review":
            return `${base}
        bg-teal-500/10
        text-blue-700 dark:text-blue-400
        border-teal-500/40
      `;

        case "not_answered":
            return `${base}
        bg-yellow-500/10
        text-yellow-800 dark:text-yellow-400
        border-yellow-500/40
      `;

        case "not_visited":
        default:
            return `${base}
        bg-muted
        text-muted-foreground
        border-border
      `;
    }
}
