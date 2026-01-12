"use client";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Brain, Target } from "lucide-react";

type Props = {
  title: string;
  description: string | null;
  onStart: () => void;
};

export function PracticeIntro({ title, description, onStart }: Props) {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <Card className="w-full max-w-md px-6 py-7 sm:px-7 sm:py-8 text-center shadow-sm">
        {/* Top section */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <Brain className="h-5 w-5 text-foreground/80" />
          </div>

          <h2 className="text-lg font-semibold tracking-tight leading-snug">
            {title}
          </h2>

          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description ??
              "This practice set is designed to help you test your understanding and reinforce what you’ve learned so far."}
          </p>
        </div>

        {/* What to expect */}
        <div className="mt-5 space-y-2.5 text-left">
          <IntroItem
            icon={Target}
            text="Check how well you understand the concepts"
          />
          <IntroItem icon={Brain} text="Learn by thinking, not memorizing" />
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="mt-7 w-full cursor-pointer"
          onClick={onStart}
        >
          Start practice
        </Button>
      </Card>
    </div>
  );
}

function IntroItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <span className="text-sm leading-relaxed text-muted-foreground">
        {text}
      </span>
    </div>
  );
}
