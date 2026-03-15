import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../tooltip";

type TitleSubtitleTooltipProps = {
  title: string;
  subtitle?: string | null;
  className?: string;
};

export function TitleSubtitleTooltip({
  title,
  subtitle,
  className,
}: TitleSubtitleTooltipProps) {
  const [open, setOpen] = useState(false);

  if (!title) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <div
          className={`flex flex-col cursor-pointer max-w-xs ${className ?? ""}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="truncate">{title}</span>

          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent align="start" className="max-w-md">
        <div className="space-y-1">
          <div className="font-medium">{title}</div>

          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
