import { Badge } from "@/src/components/ui/badge";

function RegistrationChannelBadge({
  channel,
}: {
  channel: "online" | "offline";
}) {
  switch (channel) {
    case "online":
      return (
        <Badge variant="outline" className="border-sky-500 text-sky-600">
          Online
        </Badge>
      );

    case "offline":
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Offline
        </Badge>
      );

    default:
      return <Badge variant="outline">—</Badge>;
  }
}

export default RegistrationChannelBadge;
