import { cn } from "@/src/lib/utils";
import { LoadingIndicator } from "./loading-indicator";

type LoaderSize = "sm" | "md" | "lg";

type CenteredLoaderProps = {
  message?: string;
  className?: string;
  type?: "spiked" | "normal";
  showGlow?: boolean;
  size?: LoaderSize;
};

const CenteredLoader = ({ className, ...props }: CenteredLoaderProps) => {
  return (
    <div
      className={cn(
        "flex h-(--h-viewport-minus-navbar) w-full flex-col items-center justify-center overflow-hidden",
        className,
      )}
    >
      <LoadingIndicator {...props} />
    </div>
  );
};

export default CenteredLoader;
