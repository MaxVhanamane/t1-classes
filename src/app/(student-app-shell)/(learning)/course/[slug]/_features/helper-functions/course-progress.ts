import type { CourseOutline } from "@/src/types/course-outline.types";

export function findUnitPath(
    outline: CourseOutline,
    unitId: string
): { chapterId: string; topicId: string } | null {
    for (const chapter of outline.chapters) {
        for (const topic of chapter.topics) {
            if (topic.units.some((u) => u.id === unitId)) {
                return { chapterId: chapter.id, topicId: topic.id };
            }
        }
    }
    return null;
}

export function getFirstPlayableUnit(outline: CourseOutline) {
    for (const chapter of outline.chapters) {
        for (const topic of chapter.topics) {
            for (const unit of topic.units) {
                if (unit.unitType === "video" && unit.access === "accessible") {
                    return unit.id;
                }
            }
        }
    }
    return null;
}
