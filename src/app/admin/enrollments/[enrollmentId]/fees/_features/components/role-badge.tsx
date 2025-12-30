import { cn } from "@/src/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
  parent: "bg-purple-100 text-purple-700",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        ROLE_STYLES[role] ?? "bg-muted text-muted-foreground"
      )}
    >
      {role}
    </span>
  );
}
