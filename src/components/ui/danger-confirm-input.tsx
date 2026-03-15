"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface DangerConfirmInputProps {
  confirmText?: string;
  onValidChange?: (valid: boolean) => void;
  label?: string;
}

export function DangerConfirmInput({
  confirmText = "DELETE",
  onValidChange,
  label,
}: DangerConfirmInputProps) {
  const [value, setValue] = useState("");

  const isValid = value === confirmText;

  function handleChange(v: string) {
    setValue(v);
    onValidChange?.(v === confirmText);
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-foreground">
        {label ?? (
          <>
            Type <span className="font-mono">{confirmText}</span> to confirm.
          </>
        )}
      </p>

      <Input
        placeholder={`Type ${confirmText} to confirm`}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "font-mono transition-colors",
          isValid && "border-green-600 focus-visible:ring-green-600",
        )}
      />

      {/* reserved space to prevent layout shift */}
      <div className="min-h-4 text-xs">
        {isValid && (
          <span className="text-green-600">Confirmation text matched</span>
        )}
      </div>
    </div>
  );
}
