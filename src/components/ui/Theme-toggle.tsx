"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { useMounted } from "@/src/hooks/use-mounted";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Render stable button without icons (prevents shift)
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="animate-pulse">
        <div className="h-[1.2rem] w-[1.2rem] rounded-full bg-muted-foreground/30" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
