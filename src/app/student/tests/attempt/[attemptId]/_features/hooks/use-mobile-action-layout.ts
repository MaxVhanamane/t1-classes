"use client";

import { useEffect, useState } from "react";

export type MobileActionLayout = "fixed" | "flow";

const STORAGE_KEY = "exam-mobile-action-layout";

export function useMobileActionLayout() {
  const [layoutMode, setLayoutMode] =
    useState<MobileActionLayout>(() => {
      if (typeof window === "undefined") {
        return "fixed";
      }

      const stored = localStorage.getItem(STORAGE_KEY);

      return stored === "flow" || stored === "fixed"
        ? stored
        : "fixed";
    });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  return {
    layoutMode,
    setLayoutMode,
  };
}
