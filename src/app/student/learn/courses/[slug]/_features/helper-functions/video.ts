export function extractVimeoId(url?: string | null): string | null {
    if (!url) return null;

    // matches vimeo.com/123456 or player.vimeo.com/video/123456
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}

export function getVideoEmbedUrl(
    provider?: "youtube" | "vimeo" | null,
    url?: string | null
): string {
    if (!provider || !url) return "";

    if (provider === "youtube") {
        // handles watch?v= and youtu.be
        if (url.includes("watch?v=")) {
            return url.replace("watch?v=", "embed/");
        }
        if (url.includes("youtu.be/")) {
            return url.replace("youtu.be/", "www.youtube.com/embed/");
        }
    }

    if (provider === "vimeo") {
        const id = extractVimeoId(url);
        if (id) {
            return `https://player.vimeo.com/video/${id}`;
        }
    }

    return "";
}
