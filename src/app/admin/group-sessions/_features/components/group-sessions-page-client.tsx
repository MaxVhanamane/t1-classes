"use client";

import { GroupSessionsPageHeader } from "./group-sessions-page-header";
import { GroupSessionsTable } from "./group-sessions-table";

export function GroupSessionsPageClient() {
  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <GroupSessionsPageHeader />

      <GroupSessionsTable />
    </div>
  );
}
