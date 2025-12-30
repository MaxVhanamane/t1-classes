// _components/batch-badges.tsx

import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

export function ModeBadge({ mode }: { mode: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        mode === "online" && "bg-blue-100 text-blue-800",
        mode === "offline" && "bg-green-100 text-green-800",
        mode === "hybrid" && "bg-purple-100 text-purple-800"
      )}
    >
      {mode}
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
        status === "cancelled" && "border-red-500 text-red-700"
      )}
    >
      {status}
    </Badge>
  );
}
