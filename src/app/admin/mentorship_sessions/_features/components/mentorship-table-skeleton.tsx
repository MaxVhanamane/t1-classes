export function MentorshipTableSkeleton() {
  return (
    <div className="rounded-xl border">
      <div className="border-b p-4">
        <div className="h-5 w-32 rounded bg-muted" />
      </div>

      <div className="space-y-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg border" />
        ))}
      </div>
    </div>
  );
}
