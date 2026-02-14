import { GridState } from "../types/grid.types"

export function getGridClasses(state: GridState) {
    const base =
        "transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md"

    switch (state) {
        case "answered":
            return `${base} 
        bg-green-500/15 
        text-green-700 
        border-green-500/30 
        hover:bg-green-500/25 
        dark:text-green-400`

        case "review":
            return `${base} 
        bg-purple-500/15 
        text-purple-700 
        border-purple-500/30 
        hover:bg-purple-500/25 
        dark:text-purple-400`

        case "answered_review":
            return `${base} 
        bg-teal-500/15 
        text-blue-700 
        border-teal-500/30 
        hover:bg-teal-500/25 
        dark:text-blue-400`

        case "not_answered":
            return `${base} bg-yellow-500/20 text-yellow-800 border-yellow-500/30 dark:text-yellow-400 hover:bg-yellow-500`

        case "not_visited":
        default:
            return `${base} 
        bg-muted 
        text-muted-foreground 
        border-border 
        hover:bg-muted/80`
    }
}
