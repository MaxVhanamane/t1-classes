import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground block" />
    </div>
  );
}
