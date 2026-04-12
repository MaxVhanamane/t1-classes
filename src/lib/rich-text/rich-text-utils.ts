import { JSONContent } from "@tiptap/react";

/* -------------------------------------------------------
 * Extract Plain Text from TipTap JSON
 * ----------------------------------------------------- */
export const extractTextFromNode = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";

    const n = node as {
        text?: string;
        content?: unknown[];
    };

    let text = "";

    if (typeof n.text === "string") {
        text += n.text;
    }

    if (Array.isArray(n.content)) {
        for (const child of n.content) {
            text += extractTextFromNode(child);
        }
    }

    return text;
};

/* -------------------------------------------------------
 * Check if Rich Text is Empty
 * ----------------------------------------------------- */
export const isRichTextEmpty = (
    value: JSONContent | null | undefined
): boolean => {
    if (!value) return true;

    const text = extractTextFromNode(value)
        .replace(/\u00A0/g, " ")
        .trim();

    return text.length === 0;
};

/* -------------------------------------------------------
 * Normalize Rich Text for Submission
 * Converts empty content to null
 * ----------------------------------------------------- */
export const normalizeRichText = (
    value: JSONContent | null | undefined
): JSONContent | null => {
    if (!value || isRichTextEmpty(value)) {
        return null;
    }

    return value;
};
