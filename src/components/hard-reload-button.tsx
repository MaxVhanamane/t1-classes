"use client";
import { Button } from "./ui/button";

const HardReloadButton = () => {
  return (
    <Button
      variant="default"
      onClick={() => window.location.reload()}
      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
    >
      Try again
    </Button>
  );
};

export default HardReloadButton;
