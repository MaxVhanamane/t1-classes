function toDateInput(value?: string | null) {
    return value ? value.slice(0, 10) : "";
}

function fromDateInput(value?: string) {
    return value ? value : null;
}
function truncateWords(text: string, count: number) {
    const words = text.trim().split(/\s+/);
    if (words.length <= count) return text;
    return words.slice(0, count).join(" ") + "…";
}

export { toDateInput, fromDateInput, truncateWords };


