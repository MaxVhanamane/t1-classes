"use client";

import { useEffect } from "react";

import { useTheme } from "next-themes";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff";

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
