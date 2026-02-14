import { GridItem } from "../types/grid.types"

export async function fetchGrid(
    attemptId: string
): Promise<GridItem[]> {
    const res = await fetch(
        `/api/tests/attempts/${attemptId}/grid`,
        {
            credentials: "include",
        }
    )

    if (!res.ok) {
        throw new Error("Failed to load grid")
    }

    const data = await res.json()
    return data.grid
}
