"use client";

import { PlayCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import DottedBackground from "@/src/components/dotted-background";
import { ExploreCoursesButton } from "./explore-courses-button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-0 sm:px-6 lg:px-8 ">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-background/50 px-2 py-12 shadow-sm backdrop-blur-xl sm:px-10 lg:px-16 lg:py-16 text-center">
          {/* Subtle background dots for texture */}
          <DottedBackground />

          {/* Premium top border glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent" />

          {/* Soft inner radial glow behind the content */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-120 w-120 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-3xl">
            {/* badge */}
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-xl">
              Your target rank awaits
            </div>

            {/* heading */}
            <h2 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
              Ready to crack your exam?
              <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
                Start your preparation today.
              </span>
            </h2>

            {/* description */}
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg text-balance">
              Upgrade your preparation with our rigorous learning methodology,
              advanced test analytics, and targeted live mentorship.
            </p>

            {/* buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ExploreCoursesButton />

              <Button
                variant="outline"
                size="lg"
                className="h-12 w-fit rounded-xl px-8 text-sm font-semibold sm:w-auto bg-background/50 backdrop-blur-md"
              >
                <PlayCircle className="mr-2 size-4" />
                Watch Platform Demo
              </Button>
            </div>

            {/* trust text */}
            <p className="mt-10 text-sm font-medium text-muted-foreground">
              Join thousands of students learning on T1 Classes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
