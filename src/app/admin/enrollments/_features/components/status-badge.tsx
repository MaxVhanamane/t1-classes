import { Badge } from "@/src/components/ui/badge";

type StatusBadgeProps = {
  isActive: boolean;
};

function StatusBadge({ isActive }: StatusBadgeProps) {
  if (!isActive) {
    return (
      <Badge
        variant="outline"
        className="border-red-200 bg-red-50 text-red-700"
      >
        inactive
      </Badge>
    );
  }

  return (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
      active
    </Badge>
  );
}

export default StatusBadge;
