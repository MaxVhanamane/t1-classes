"use client";

import { LiveClassVideoPlayer } from "./live-class-video-player";

type Props = {
  videoUrl: string;
  chatUrl: string;
  query: {
    title?: string;
    youtube?: string;
    description?: string;
  };
};

const LiveClassClient = ({ query, videoUrl, chatUrl }: Props) => {
  return (
    <>
      {/* LEFT SIDE */}
      <section className="space-y-3">
        <div className="overflow-hidden bg-black md:rounded-2xl md:border">
          <LiveClassVideoPlayer
            title={query.title ?? "Live Class"}
            videoUrl={videoUrl}
          />
        </div>

        <div className="px-3 pb-2 md:px-1">
          <h1 className="text-lg font-semibold leading-tight md:text-xl">
            {query.title ?? "Live Class"}
          </h1>

          {query.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {query.description}
            </p>
          )}
        </div>
      </section>

      {/* RIGHT SIDE */}
      <aside className="overflow-hidden border bg-card md:rounded-2xl lg:self-start">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Live Chat</p>
        </div>

        <div className="h-[60dvh] sm:h-[65dvh] lg:h-150">
          <iframe
            title="Live Chat"
            src={chatUrl}
            className="h-full w-full"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </aside>
    </>
  );
};

export default LiveClassClient;
