type EmptyPlayerStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyPlayerState({
  title = "No content selected",
  message = "Select a video or document from the course content to begin.",
  actionLabel,
  onAction,
}: EmptyPlayerStateProps) {
  return (
    <div className="flex lg:rounded-xl flex-col items-center justify-center gap-3 text-center text-muted-foreground px-4 dark:bg-muted-soft bg-muted aspect-video">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs max-w-sm leading-relaxed">{message}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
