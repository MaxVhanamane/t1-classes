import {
    HomeworkMaterialFilters,
    HomeworkType,
    HomeworkDifficulty
} from "../types/homework";

export const HOMEWORK_TYPES: { label: string; value: HomeworkType }[] = [
    { label: "Daily Practice Problem (DPP)", value: "dpp" },
    { label: "Assignment", value: "assignment" },
];

export const HOMEWORK_DIFFICULTIES: { label: string; value: HomeworkDifficulty }[] = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
    { label: "Mixed", value: "mixed" },
];

export const DEFAULT_HOMEWORK_FILTERS: HomeworkMaterialFilters = {
    search: "",
    classLevel: null,
    subject: null,
    targetExam: null,
    chapterId: null,
    homeworkType: null,
    difficulty: null,
    page: 1,
};
