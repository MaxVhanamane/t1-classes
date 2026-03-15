import { Area } from "react-easy-crop";

/* -------------------------------------------- */
/* Types                                        */
/* -------------------------------------------- */

type OutputConfig = {
    width: number;
    height: number;
    format?: "image/webp" | "image/jpeg" | "image/png";
    quality?: number;
    fileName?: string;
};

/* -------------------------------------------- */
/* Main helper                                  */
/* -------------------------------------------- */

export async function getCroppedImageFile(
    imageSrc: string,
    crop: Area,
    output: OutputConfig,
): Promise<File> {
    const image = await createImage(imageSrc);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Canvas context not available");
    }

    /* -------------------------------------------- */
    /* Output settings                              */
    /* -------------------------------------------- */

    const width = output.width;
    const height = output.height;
    const format = output.format ?? "image/webp";
    const quality = output.quality ?? 0.85;
    const fileName = output.fileName ?? "cropped";

    canvas.width = width;
    canvas.height = height;

    /* -------------------------------------------- */
    /* Draw cropped → resized                       */
    /* -------------------------------------------- */

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        width,
        height,
    );

    /* -------------------------------------------- */
    /* Export file                                  */
    /* -------------------------------------------- */

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Image crop failed"));
                    return;
                }

                const extension = format.split("/")[1];

                const file = new File(
                    [blob],
                    `${fileName}.${extension}`,
                    { type: format },
                );

                resolve(file);
            },
            format,
            quality,
        );
    });
}

/* -------------------------------------------- */
/* Image loader                                 */
/* -------------------------------------------- */

function createImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
