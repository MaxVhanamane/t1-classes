// _components/batch-badges.tsx

import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { getBatchLifecycle } from "@/src/lib/helper-functions/get-batch-lifecycle";
import { Wifi, Building2, Layers } from "lucide-react";

type Mode = "online" | "offline" | "hybrid";

export function ModeBadge({ mode }: { mode: Mode }) {
  const config: Record<
    Mode,
    {
      label: string;
      icon: React.ReactNode;
      className: string;
    }
  > = {
    online: {
      label: "Online",
      icon: <Wifi className="h-3.5 w-3.5" />,
      className: `
        bg-blue-500/10
        text-blue-600
        border-blue-500/20
        dark:text-blue-400
      `,
    },

    offline: {
      label: "Offline",
      icon: <Building2 className="h-3.5 w-3.5" />,
      className: `
        bg-emerald-500/10
        text-emerald-600
        border-emerald-500/20
        dark:text-emerald-400
      `,
    },

    hybrid: {
      label: "Hybrid",
      icon: <Layers className="h-3.5 w-3.5" />,
      className: `
        bg-violet-500/10
        text-violet-600
        border-violet-500/20
        dark:text-violet-400
      `,
    },
  };

  const m = config[mode];

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-0.5 font-medium",
        "border",
        m.className,
      )}
    >
      {m.icon}
      {m.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "upcoming" && "border-yellow-400 text-yellow-700",
        status === "ongoing" && "border-green-500 text-green-700",
        status === "completed" && "border-gray-400 text-gray-700",
        status === "cancelled" && "border-red-500 text-red-700",
      )}
    >
      {status}
    </Badge>
  );
}

type Props = {
  batch: {
    start_date: string;
    end_date: string;
  };
};

export function LifecycleBadge({ batch }: Props) {
  const lifecycle = getBatchLifecycle(batch);

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize border",

        // UPCOMING
        lifecycle === "upcoming" &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",

        // ONGOING
        lifecycle === "ongoing" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",

        // COMPLETED
        lifecycle === "completed" &&
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",

          lifecycle === "upcoming" && "bg-amber-500 dark:bg-amber-400",

          lifecycle === "ongoing" && "bg-emerald-500 dark:bg-emerald-400",

          lifecycle === "completed" && "bg-slate-500 dark:bg-slate-400",
        )}
      />

      {lifecycle}
    </Badge>
  );
}
