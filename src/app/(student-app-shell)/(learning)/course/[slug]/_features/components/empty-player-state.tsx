type EmptyPlayerStateProps = {
  title?: string;
  message?: string;
};

export default function EmptyPlayerState({
  title = "No content selected",
  message = "Select a video or document from the course content to begin.",
}: EmptyPlayerStateProps) {
  return (
    <div className="flex rounded-sm lg:rounded-xl flex-col items-center justify-center gap-2 text-center text-muted-foreground px-4 bg-muted aspect-video">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs max-w-sm leading-relaxed">{message}</p>
    </div>
  );
}
