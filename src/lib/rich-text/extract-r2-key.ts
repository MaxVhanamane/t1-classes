import { JSONContent } from "@tiptap/core";

export function extractR2Keys(json: JSONContent | null | undefined): { key: string; bucket: string }[] {
    let results: { key: string; bucket: string }[] = [];

    if (!json) return results;

    // If this node is an image and has our custom R2 attributes
    if (json.type === "image" && json.attrs?.r2Key && json.attrs?.bucket) {
        results.push({
            key: json.attrs.r2Key as string,
            bucket: json.attrs.bucket as string
        });
    }

    // Recursively check all child nodes (paragraphs, table cells, etc.)
    if (Array.isArray(json.content)) {
        for (const child of json.content) {
            results = results.concat(extractR2Keys(child));
        }
    }

    return results;
}
