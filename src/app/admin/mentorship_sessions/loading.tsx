import { MentorshipTableSkeleton } from "./_features/components/mentorship-table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-16 rounded-xl border" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-xl border" />
        <div className="h-28 rounded-xl border" />
        <div className="h-28 rounded-xl border" />
      </div>

      <MentorshipTableSkeleton />
    </div>
  );
}
