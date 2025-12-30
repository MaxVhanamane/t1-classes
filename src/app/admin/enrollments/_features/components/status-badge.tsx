import { Badge } from "@/src/components/ui/badge";
import { EnrollmentRow } from "../types/enrollments";

function StatusBadge({
  status,
  isActive,
}: {
  status: EnrollmentRow["status"];
  isActive: boolean;
}) {
  if (!isActive) {
    return <Badge variant="outline">inactive</Badge>;
  }

  switch (status) {
    case "ongoing":
      return <Badge className="bg-green-600">ongoing</Badge>;
    case "paused":
      return <Badge variant="secondary">paused</Badge>;
    case "completed":
      return <Badge variant="outline">completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default StatusBadge;
