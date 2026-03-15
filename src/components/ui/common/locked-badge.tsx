import { Badge } from "../badge";
import { Lock } from "lucide-react";

const LockedBadge = () => {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 text-xs shrink-0 bg-amber-100 dark:bg-amber-600"
    >
      <Lock className="h-3 w-3" />
      Locked
    </Badge>
  );
};

export default LockedBadge;
