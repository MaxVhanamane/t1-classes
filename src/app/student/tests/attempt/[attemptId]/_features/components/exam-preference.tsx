"use client";

import { Monitor, Moon, Settings, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { LayoutGroup, motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { MobileActionLayout } from "../hooks/use-mobile-action-layout";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

type Props = {
  layoutMode: MobileActionLayout;
  onLayoutModeChange: (mode: MobileActionLayout) => void;
};

export default function ExamPreferencesPopover({
  layoutMode,
  onLayoutModeChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const isFixedLayout = layoutMode === "fixed";
  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Monitor },
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Exam preferences</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-lg border bg-slate-100/70 p-0 shadow-none backdrop-blur-xl dark:bg-muted-soft"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b bg-linear-to-b from-muted/30 to-transparent px-4 py-3">
          <div>
            <h4 className="text-sm text-foreground font-semibold tracking-tight">
              Exam Preferences
            </h4>

            <p className="mt-1 text-xs text-muted-foreground">
              Personalize your exam experience.
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Layout */}
          <section className="space-y-2">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Action Buttons
            </div>

            <PreferenceCard
              selected={isFixedLayout}
              title="Stable Actions"
              description="Buttons stay fixed at the bottom for faster navigation."
              onClick={() => onLayoutModeChange("fixed")}
            />

            <PreferenceCard
              selected={!isFixedLayout}
              title="Follow Content"
              description="Buttons appear after question content for a more natural reading flow."
              onClick={() => onLayoutModeChange("flow")}
            />
          </section>

          {/* Divider */}
          <div className="my-4 border-t" />

          {/* Theme */}
          <section className="space-y-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Appearance
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Choose your preferred theme.
              </p>
            </div>

            <LayoutGroup id="theme-selector">
              <div className="grid grid-cols-3 rounded-xl border bg-muted/40 p-1">
                {themes.map(({ value, label, icon: Icon }) => {
                  const active = theme === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className="relative h-10 rounded-lg"
                    >
                      {active && (
                        <motion.div
                          layoutId="active-theme"
                          className="absolute inset-0 rounded-lg bg-background "
                          transition={{
                            type: "spring",
                            stiffness: 220,
                            damping: 22,
                            mass: 1,
                          }}
                        />
                      )}

                      <div
                        className={cn(
                          "relative z-10 flex h-full items-center justify-center gap-2 text-xs font-medium transition-colors",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type PreferenceCardProps = {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
};

function PreferenceCard({
  selected,
  title,
  description,
  onClick,
}: PreferenceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200",
        selected
          ? "border-primary/20 bg-primary/4"
          : "border-border hover:bg-muted/50",
      )}
    >
      <div className="pt-0.5">
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border transition-all",
            selected ? "border-primary" : "border-muted-foreground/40",
          )}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground/80">{title}</div>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}
