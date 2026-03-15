import { toast } from "sonner";
import { formatFileSize } from "./format-file-size";

/* -------------------------------------------- */
type ValidateOptions = {
    file: File;
    maxSize: number;
    minWidth: number;
    minHeight: number;
    allowedTypes: readonly string[];
};

/* -------------------------------------------- */
export async function validateImage({
    file,
    maxSize,
    minWidth,
    minHeight,
    allowedTypes,
}: ValidateOptions): Promise<string | null> {
    /* ---------- Type ---------- */
    if (!allowedTypes.includes(file.type)) {
        const extensions = allowedTypes
            .map((t) => t.replace("image/", "."))
            .join(", ");

        toast.error(`Invalid file type. Allowed: ${extensions}`);
        return null;
    }

    /* ---------- Size ---------- */
    if (file.size > maxSize) {
        toast.error(
            `Image too large. Max size ${formatFileSize(maxSize)}`
        );
        return null;
    }

    /* ---------- Dimensions ---------- */
    const url = URL.createObjectURL(file);
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
    });

    if (img.width < minWidth || img.height < minHeight) {
        toast.error(
            `Image too small. Minimum resolution ${minWidth}×${minHeight}px`
        );
        URL.revokeObjectURL(url);
        return null;
    }

    return url;
}
