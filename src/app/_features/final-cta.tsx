import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 -z-10">
        {/* glow */}
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-background/70 px-6 py-16 shadow-2xl backdrop-blur-xl sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* badge */}
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-xl">
              Start your preparation today
            </div>

            {/* heading */}
            <h2 className="mt-6 text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Learn smarter.
              <span className="block bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Practice better. Score higher.
              </span>
            </h2>

            {/* description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Join thousands of students preparing with structured courses,
              advanced testing, live mentorship, and focused learning tools.
            </p>

            {/* buttons */}
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-2xl px-6 text-sm font-semibold sm:px-8"
              >
                Explore Courses
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl px-6 text-sm font-semibold sm:px-8"
              >
                <PlayCircle className="mr-2 size-4" />
                Watch Demo
              </Button>
            </div>

            {/* trust text */}
            <p className="mt-8 text-sm text-muted-foreground">
              Trusted by thousands of students across competitive exam
              preparation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
