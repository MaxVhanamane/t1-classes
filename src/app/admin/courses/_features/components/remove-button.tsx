import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="
        text-muted-foreground
        hover:text-destructive
        hover:bg-destructive/10
      "
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
