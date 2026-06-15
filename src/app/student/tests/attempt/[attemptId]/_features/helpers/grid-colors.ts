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
        text-foreground
        border-green-500/40
      `;

    case "review":
      return `${base}
        bg-purple-500/10
        text-foreground
        border-purple-500/40
      `;

    case "answered_review":
      return `${base}
       dark:bg-blue-500/10 bg-blue-200 border-blue-500/40 text-foreground
      `;

    case "not_answered":
      return `${base}
        bg-yellow-500/10
        text-foreground
        border-yellow-500/40
      `;

    case "not_visited":
    default:
      return `${base}
        bg-muted
        text-foreground
        border-border
      `;
  }
}
