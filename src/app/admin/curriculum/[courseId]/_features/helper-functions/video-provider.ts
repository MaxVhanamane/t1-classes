export type VideoProvider = "youtube" | "vimeo";

export function detectVideoProvider(
    url: string
): VideoProvider | null {
    try {
        const parsed = new URL(url);

        if (
            parsed.hostname.includes("youtube.com") ||
            parsed.hostname.includes("youtu.be")
        ) {
            return "youtube";
        }

        if (parsed.hostname.includes("vimeo.com")) {
            return "vimeo";
        }

        return null;
    } catch {
        return null;
    }
}
