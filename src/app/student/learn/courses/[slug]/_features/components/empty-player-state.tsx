import { AnimatePresence, motion } from "motion/react";
import { Loader } from "lucide-react";

type EmptyPlayerStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;

  variant?: "default" | "loading";
  loadingLabel?: string;
};

export default function EmptyPlayerState({
  title = "No content selected",
  message = "Select a video or document from the course content to begin.",
  actionLabel,
  onAction,

  variant = "default",
  loadingLabel = "Preparing your content...",
}: EmptyPlayerStateProps) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center overflow-hidden bg-muted px-4 text-center text-muted-foreground dark:bg-muted-soft lg:rounded-xl">
      <AnimatePresence mode="wait">
        {variant === "loading" ? (
          <motion.div
            key="loading"
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.98,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
              filter: "blur(4px)",
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur"
          >
            <Loader className="h-4 w-4 animate-spin text-foreground/70" />

            <span className="text-xs text-foreground/70">{loadingLabel}</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.98,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
              filter: "blur(4px)",
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm font-medium">{title}</p>

            <p className="max-w-sm text-xs leading-relaxed">{message}</p>

            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {actionLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
