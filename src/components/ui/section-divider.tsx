import { cn } from "@/src/lib/utils";

type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn(
        "relative my-10 flex items-center justify-center",
        className,
      )}
    >
      <div className="h-px w-full bg-border/40" />
      <div className="absolute h-1 w-12 rounded-full bg-border/70" />
    </div>
  );
}
