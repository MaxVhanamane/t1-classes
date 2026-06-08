import { cn } from "@/src/lib/utils";
import { Loader } from "lucide-react";

type CenteredLoaderProps = {
  message?: string;
  className?: string;
};

const CenteredLoader = ({ message, className }: CenteredLoaderProps) => {
  return (
    <div
      className={cn(
        "flex h-(--h-viewport-minus-navbar) flex-col items-center justify-center gap-3 overflow-hidden",
        className,
      )}
    >
      <Loader className="size-6 animate-spin text-muted-foreground" />

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default CenteredLoader;
