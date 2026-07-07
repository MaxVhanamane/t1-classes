import { ElementType } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import DottedBackground from "@/src/components/dotted-background";

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-xl bg-inverse shadow-sm transition-shadow hover:shadow-md py-2">
      {/* Subtle top glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />

      {/* Gradient glow: Visible in light mode, hidden in dark mode */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/2 to-transparent dark:hidden" />

      <DottedBackground className="opacity-50 dark:opacity-60" />

      {/* Main inner content */}
      <CardContent className="relative flex h-full flex-col gap-5 p-6">
        {/* icon */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border">
          <Icon
            className="size-5 text-secondary-foreground"
            strokeWidth={1.5}
          />
        </div>

        {/* content text */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
