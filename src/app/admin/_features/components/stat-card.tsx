import { cn } from "@/src/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "destructive";
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-5 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        </div>

        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accent === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
