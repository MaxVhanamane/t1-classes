export default function LiveClassPage() {
  const videoId = "F_0Bh0d1Ozk";
  const domain =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${domain}`;
  const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full md:max-w-5xl md:mx-auto md:px-4 lg:px-6">
        <div className="relative w-full bg-black md:rounded-2xl md:overflow-hidden md:mt-4">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full"
              src={videoUrl}
              title="YouTube Live"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-600 text-xs font-bold animate-pulse">
            LIVE
          </div>
        </div>

        <div className="px-3 py-3 md:px-0 border-b border-zinc-900 md:border-zinc-800">
          <h1 className="text-lg font-semibold">Live Class</h1>
          <p className="text-zinc-400 text-xs">Watch and chat in real time</p>
        </div>

        <div className="w-full bg-zinc-950 md:rounded-2xl md:overflow-hidden md:mt-4">
          <iframe
            className="w-full h-[calc(100vh-290px)] md:h-[600px]"
            src={chatUrl}
            title="YouTube Live Chat"
          />
        </div>
      </div>
    </div>
  );
}
