"use client";

import { Button } from "@/src/components/ui/button";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { Keyboard } from "lucide-react";

interface ShortcutsPopoverProps {
  inactiveClass?: string;
}

export function ShortcutsPopover({ inactiveClass }: ShortcutsPopoverProps) {
  const shortcuts = [
    // Arrows
    { keys: "->", symbol: "→" },
    { keys: "<-", symbol: "←" },
    { keys: "<=>", symbol: "⇌" },
    { keys: "=>", symbol: "⇒" },

    // Math Operators
    { keys: "!=", symbol: "≠" },
    { keys: ">=", symbol: "≥" },
    { keys: "<=", symbol: "≤" },
    { keys: "+-", symbol: "±" },
    { keys: "~=", symbol: "≈" },

    // Geometry & Greek (Requires Space)
    { keys: "_deg + Space", symbol: "°" },
    { keys: "_angle + Space", symbol: "∠" },
    { keys: "_tri + Space", symbol: "△" },
    { keys: "_theta + Space", symbol: "θ" },
    { keys: "_alpha + Space", symbol: "α" },
    { keys: "_beta + Space", symbol: "β" },
    { keys: "_pi + Space", symbol: "π" },
    { keys: "_delta + Space", symbol: "Δ" },
  ];

  return (
    <div className="ml-auto">
      <RichPopover
        trigger={
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={inactiveClass}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        }
        color="indigo"
        badgeText="Shortcuts"
        title="Auto-Format Shortcuts"
        description="Type these combinations while writing. They will instantly convert to symbols!"
      >
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex justify-between border-b pb-1 border-border/50"
            >
              <code className="text-muted-foreground whitespace-nowrap">
                {shortcut.keys}
              </code>
              <span className="font-medium">{shortcut.symbol}</span>
            </div>
          ))}
        </div>
      </RichPopover>
    </div>
  );
}
