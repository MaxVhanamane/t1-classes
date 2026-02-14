"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-6">
      <h2>Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  );
}
