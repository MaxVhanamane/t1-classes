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
/* PDF MIME Types                                     */
/* ================================================== */

export const ALLOWED_PDF_MIME_TYPES = [
    "application/pdf",
] as const;

/* Extensions (for input accept attr) */

export const ALLOWED_PDF_EXTENSIONS = [
    ".pdf",
] as const;

/* ================================================== */
/* Asset Types                                        */
/* ================================================== */

export type AssetType =
    | "course_thumbnail"
    | "instructor_avatar"
    | "user_avatar"
    | "course_pdf"
    | "batch_thumbnail"
    | "question_paper";

/* ================================================== */
/* SIZE LIMITS                                        */
/* ================================================== */

export const SIZE_LIMITS: Record<
    AssetType,
    number
> = {
    course_thumbnail:
        500 * 1024, // 500KB

    batch_thumbnail:
        500 * 1024,

    instructor_avatar:
        500 * 1024,

    user_avatar:
        200 * 1024,

    course_pdf:
        5 * 1024 * 1024, // 5MB

    question_paper:
        5 * 1024 * 1024, // 5MB
};

export const VALID_ASSET_TYPES: AssetType[] = [
    "course_thumbnail",
    "instructor_avatar",
    "user_avatar",
    "course_pdf",
    "batch_thumbnail",
    "question_paper",
];

/* ================================================== */
/* Helper                                             */
/* ================================================== */

export function isValidImageType(
    file: File,
): boolean {
    return ALLOWED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    );
}

export function isValidPdfType(
    file: File,
): boolean {
    return ALLOWED_PDF_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_PDF_MIME_TYPES)[number],
    );
}
