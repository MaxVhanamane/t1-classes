"use client";

interface VideoEmbedProps {
  provider: "youtube" | "vimeo";
  url: string;
}

export function VideoEmbed({ provider, url }: VideoEmbedProps) {
  let embedUrl: string | null = null;

  if (provider === "youtube") {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  if (provider === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  if (!embedUrl) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Unable to preview this video.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-md border aspect-video">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
