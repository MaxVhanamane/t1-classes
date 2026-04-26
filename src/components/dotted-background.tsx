import { cn } from "../lib/utils";

type DottedBackgroundProps = {
  className?: string;
};

const DottedBackground = ({ className }: DottedBackgroundProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 opacity-60 pointer-events-none",
        "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_0.7px,transparent_0)]",
        "dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_0.7px,transparent_0)]",
        "bg-size-[8px_8px]",
        className,
      )}
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 75% 65% at center, black 35%, transparent 100%)",
        maskImage:
          "radial-gradient(ellipse 75% 65% at center, black 35%, transparent 100%)",
      }}
    />
  );
};

export default DottedBackground;
