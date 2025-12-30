import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";
export function TruncatedWithTooltip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text]);

  const content = (
    <div ref={ref} className={cn("truncate max-w-55", className)}>
      {text}
    </div>
  );

  //  If not truncated → no tooltip at all
  if (!isTruncated) {
    return content;
  }

  //  Tooltip only when needed
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
