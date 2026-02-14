import { GridItem, GridState } from "../types/grid.types"

export function optimisticUpdateGrid(
    grid: GridItem[],
    questionId: string,
    nextState: GridState
): GridItem[] {
    return grid.map((item) =>
        item.question_id === questionId
            ? { ...item, state: nextState }
            : item
    )
}
