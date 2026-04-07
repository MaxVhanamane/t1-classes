import { Loader } from "lucide-react";

export function LoadingPracticeSet() {
  return (
    <div className="flex flex-col h-full justify-center items-center gap-3 text-muted-foreground">
      <Loader className="h-6 w-6 animate-spin" />
      <p className="text-sm">Preparing practice questions…</p>
    </div>
  );
}
