import { notFound } from "next/navigation";
import { LiveClassVideoPlayer } from "./_features/components/live-class-video-player";

type Props = {
  params: Promise<{
    liveClassId: string;
  }>;
  searchParams: Promise<{
    title?: string;
    youtube?: string;
    description?: string;
  }>;
};

function getEmbedDomain() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return "localhost";
  }

  try {
    return new URL(siteUrl).hostname;
  } catch {
    return siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { liveClassId } = await params;

  const query = await searchParams;

  if (!liveClassId || !query.youtube) {
    notFound();
  }

  const embedDomain = getEmbedDomain();

  const videoUrl =
    `https://www.youtube-nocookie.com/embed/${query.youtube}` +
    `?autoplay=1` +
    `&rel=0` +
    `&controls=1` +
    `&fs=0` +
    `&playsinline=1` +
    `&iv_load_policy=3` +
    `&modestbranding=1`;

  const chatUrl =
    `https://www.youtube.com/live_chat?v=${query.youtube}` +
    `&embed_domain=${embedDomain}` +
    `&dark_theme=1`;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-450 md:px-4 md:py-4">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
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
        </div>
      </div>
    </div>
  );
}
