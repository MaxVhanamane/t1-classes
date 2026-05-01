import { notFound } from "next/navigation";
import LiveClassClient from "./_features/components/live-class-client";

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

  if (!siteUrl) return "localhost";

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
    `?rel=0&controls=1&fs=0&playsinline=1&iv_load_policy=3&modestbranding=1&enablejsapi=1`;

  const chatUrl =
    `https://www.youtube.com/live_chat?v=${query.youtube}` +
    `&embed_domain=${embedDomain}&dark_theme=1`;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-450 md:px-4 md:py-4">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <LiveClassClient
            query={query}
            videoUrl={videoUrl}
            chatUrl={chatUrl}
          />
        </div>
      </div>
    </div>
  );
}
