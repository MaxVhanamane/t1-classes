import { Badge } from "@/src/components/ui/badge";

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
          className="   bg-emerald-500/10
        text-emerald-600
        border-emerald-500/20
        dark:text-emerald-400"
        >
          Online
        </Badge>
      );

    case "offline":
      return (
        <Badge
          variant="outline"
          className="    bg-blue-500/10
        text-blue-600
        border-blue-500/20
        dark:text-blue-400"
        >
          Offline
        </Badge>
      );

    default:
      return <Badge variant="outline">—</Badge>;
  }
}

export default RegistrationChannelBadge;
