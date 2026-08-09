"use client";

import { usePWAInstall } from "@/src/providers/pwa-install-provider";
import { MonitorDown } from "lucide-react"; // Default icon library for shadcn
import { Button } from "../button";

// Extract all valid props from the shadcn Button and add our custom prop
interface InstallAppButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * If true, only shows the download icon in a square button.
   * If false, shows the icon + "Install App" text.
   */
  iconOnly?: boolean;
}

export function InstallAppButton({
  iconOnly = false,
  className,
  variant = "default",
  ...props
}: InstallAppButtonProps) {
  const { isInstallable, installApp } = usePWAInstall();

  // If the app is already installed or the event hasn't fired, render nothing
  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={installApp}
      title={iconOnly ? "Install App" : undefined}
      aria-label="Install App"
      variant={variant}
      size="sm"
      className={className}
      {...props}
    >
      <MonitorDown className={iconOnly ? "h-4 w-4" : "mr-2 h-4 w-4"} />
      {!iconOnly && "Install App"}
    </Button>
  );
}
