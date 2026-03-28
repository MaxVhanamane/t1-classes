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
/* SIZE LIMITS                                        */
/* ================================================== */

export const SIZE_LIMITS: Record<
    AssetType,
    number
> = {
    course_thumbnail: 500 * 1024, // 500KB
    batch_thumbnail: 500 * 1024,
    instructor_avatar: 500 * 1024,
    user_avatar: 200 * 1024,
    course_pdf: 5 * 1024 * 1024, // 5MB
};



export type AssetType =
    | "course_thumbnail"
    | "instructor_avatar"
    | "user_avatar"
    | "course_pdf"
    | "batch_thumbnail"

export const VALID_ASSET_TYPES: AssetType[] = [
    "course_thumbnail",
    "instructor_avatar",
    "user_avatar",
    "course_pdf",
    "batch_thumbnail"
];

/* ================================================== */
/* Helper                                             */
/* ================================================== */

export function isValidImageType(file: File): boolean {
    return ALLOWED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    );
}
