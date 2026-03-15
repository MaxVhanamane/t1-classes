import { Button } from "@/src/components/ui/button";

type PlayerErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function PlayerErrorState({
  title = "Unable to load content",
  message,
  onRetry,
}: PlayerErrorStateProps) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-sm lg:rounded-xl bg-destructive/5 px-4 text-center">
      <p className="text-sm font-semibold text-destructive">{title}</p>

      <p className="text-xs max-w-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="destructive">
          Retry
        </Button>
      )}
    </div>
  );
}
