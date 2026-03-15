/* -------------------------------------------------- */
/* Slugify (Multilingual Safe)                       */
/* -------------------------------------------------- */
export function slugify(text: string): string {
    return text
        .normalize("NFKD")                     // Normalize Unicode
        .replace(/[\u0300-\u036f]/g, "")       // Remove diacritics (é → e)
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^\p{L}\p{N}]+/gu, "-")      // Keep letters + numbers (any language)
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
/* -------------------------------------------------- */
/* 6 digit numeric generator                          */
/* -------------------------------------------------- */
export function generateSixDigit(): string {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}

/* -------------------------------------------------- */
/* Final batch slug generator                        */
/* -------------------------------------------------- */
export function generateBatchSlug(title: string): string {
    const baseSlug = slugify(title);

    const safeBase = baseSlug.length ? baseSlug : "batch";

    const random = generateSixDigit();

    return `${safeBase}--${random}`;
}
