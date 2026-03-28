// image-output.config.ts

export const IMAGE_OUTPUTS = {
    THUMBNAIL: {
        width: 750,
        height: 422,
        format: "image/webp",
        quality: 0.95,
        fileName: "thumbnail",
    },

    INSTRUCTOR_AVATAR: {
        width: 400,
        height: 400,
        format: "image/webp",
        quality: 1,
        fileName: "avatar",
    },

    USER_AVATAR: {
        width: 256,
        height: 256,
        format: "image/webp",
        quality: 0.9,
        fileName: "avatar",
    },

    BANNER: {
        width: 1600,
        height: 900,
        format: "image/webp",
        quality: 0.85,
        fileName: "banner",
    },
} as const;
