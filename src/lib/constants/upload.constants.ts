/* ================================================== */
/* Image MIME Types                                   */
/* ================================================== */

export const ALLOWED_IMAGE_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
] as const;

/* Extensions (for input accept attr) */

export const ALLOWED_IMAGE_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
] as const;

/* ================================================== */
/* Helper                                             */
/* ================================================== */

export function isValidImageType(file: File): boolean {
    return ALLOWED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    );
}
