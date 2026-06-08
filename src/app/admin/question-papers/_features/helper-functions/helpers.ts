export function formatFileSize(bytes: number | null) {
    if (!bytes) {
        return "-";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
export function formatYears(years: number[]) {
    if (years.length === 0) {
        return "-";
    }

    if (years.length === 1) {
        return String(years[0]);
    }

    const sorted = [...years].sort((a, b) => a - b);

    return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

export function formatCategory(category: "previous_year" | "practice") {
    return category === "previous_year" ? "Previous Year" : "Practice";
}
