import { GroupSessionsPageHeader } from "./_features/components/group-sessions-page-header";
import { GroupSessionsTable } from "./_features/components/group-sessions-table";

export default async function GroupSessionsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <GroupSessionsPageHeader />

      <GroupSessionsTable />
    </div>
  );
}
