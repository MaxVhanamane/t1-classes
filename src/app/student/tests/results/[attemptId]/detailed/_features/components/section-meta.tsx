import { cn } from "@/src/lib/utils";

type MetaTone = "default" | "positive" | "negative" | "warning";

interface MetaProps {
  label: string;
  value: string;
  tone?: MetaTone;
}

export function Meta({ label, value, tone = "default" }: MetaProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-background">
      {/* Label → always muted */}
      <span className="text-muted-foreground">{label}</span>

      {/* Value → semantic color only */}
      <span
        className={cn(
          "font-medium",

          tone === "positive" && "text-green-600 dark:text-green-400",

          tone === "negative" && "text-red-600 dark:text-red-400",

          tone === "warning" && "text-yellow-600 dark:text-yellow-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}
