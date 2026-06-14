import { Badge } from "@/src/components/ui/badge";
import { Building2, Globe } from "lucide-react";

function RegistrationChannelBadge({
  channel,
}: {
  channel: "online" | "offline";
}) {
  switch (channel) {
    case "online":
      return (
        <Badge
          variant="outline"
          className="
    inline-flex items-center gap-1.5 rounded-full
    border-amber-500/20 bg-amber-500/10
    px-3 py-1 font-medium
    text-amber-700 hover:bg-amber-500/10
    dark:border-amber-400/20 dark:bg-amber-400/10
    dark:text-amber-300
  "
        >
          <Globe className="size-3.5 shrink-0" />
          Online
        </Badge>
      );

    case "offline":
      return (
        <Badge
          variant="outline"
          className="
    inline-flex items-center gap-1.5 rounded-full
    border-sky-500/20 bg-sky-500/10
    px-3 py-1 font-medium
    text-sky-700 hover:bg-sky-500/10
    dark:border-sky-400/20 dark:bg-sky-400/10
    dark:text-sky-300
  "
        >
          <Building2 className="size-3.5 shrink-0" />
          Offline
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className="rounded-full">
          —
        </Badge>
      );
  }
}

export default RegistrationChannelBadge;
