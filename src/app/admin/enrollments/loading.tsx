import { AdminHeaderSkeleton } from "@/src/components/ui/skeleton/table/admin-header-skeleton";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";
import { CardSkeleton } from "@/src/components/ui/skeleton/table/table-cards-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <AdminHeaderSkeleton />
      <TableSkeleton columns={8} />
      <CardSkeleton />
    </div>
  );
}
