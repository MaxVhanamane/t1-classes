import { GridItem, SectionGrid } from "../types/grid.types"

export function mapGridToSections(
    grid: GridItem[],
    sections: { id: string; title: string }[]
): SectionGrid[] {
    let counter = 1

    return sections.map((section) => {
        const questions = grid
            .filter((q) => q.section_id === section.id)
            .map((q) => ({
                id: q.question_id,
                index: counter++,
                state: q.state,
            }))

        return {
            sectionId: section.id,
            title: section.title,
            startIndex:
                questions.length > 0
                    ? questions[0].index
                    : counter,
            questions,
        }
    })
}
