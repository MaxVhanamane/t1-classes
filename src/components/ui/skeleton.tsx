import { cn } from "@/src/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-accent",

        // shimmer layer
        "before:absolute before:inset-0 before:content-['']",

        // softer gradient
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]",
        "dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]",

        // smoother motion
        "before:-translate-x-full",
        "before:animate-[shimmer_2.2s_ease-in-out_infinite]",

        // soften edges
        "before:blur-sm",

        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
