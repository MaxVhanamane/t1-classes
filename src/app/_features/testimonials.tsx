"use client";

import { Quote, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import DottedBackground from "@/src/components/dotted-background";

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "JEE Advanced Batch",
    initials: "AS",
    content:
      "The advanced test engine is a game-changer. Seeing exactly how many seconds I spent per question compared to the class average completely fixed my time management.",
  },
  {
    name: "Priya Patil",
    role: "NEET Elite Course",
    initials: "PP",
    content:
      "I used to just passively watch lectures. The strict Video → Practice → Analyze loop forced me to actually apply the concepts instantly. The targeted live doubt sessions are incredibly efficient.",
  },
  {
    name: "Rohan Kulkarni",
    role: "Foundation Program",
    initials: "RK",
    content:
      "The group sessions completely cured my exam anxiety. Plus, tracking my negative and partial marks in the post-test analytics taught me exactly when to skip a hard question.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Header ── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Hear from our students
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
          Built for every student.
          <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
            Proven by real results.
          </span>
        </h2>
        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
          Whether you are just starting your preparation or aiming for the top
          rank, see how our platform helps you improve and gain confidence every
          single day.
        </p>
      </div>

      {/* ── Testimonials Grid ── */}
      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <Card
            key={testimonial.name}
            // 1. Removed 'py-2' bug and added 'bg-inverse' to match the pure black/white theme
            className="group relative overflow-hidden rounded-xl bg-inverse shadow-sm transition-shadow hover:shadow-md py-4"
          >
            {/* 2. Sharp top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />

            {/* 3. Ambient top glow: Visible in light mode, hidden in dark mode */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/5 to-transparent dark:hidden" />

            {/* 4. Dotted background matching the feature cards */}
            <DottedBackground className="opacity-50 dark:opacity-60" />

            {/* 5. Mobile-optimized padding (p-6 on mobile, p-8 on desktop) */}
            <CardContent className="relative flex h-full flex-col p-6 sm:p-8">
              {/* Decorative Quote Icon */}
              <Quote
                className="absolute right-6 top-6 size-10 -rotate-12 text-primary/10 transition-colors duration-300 group-hover:text-primary/20"
                strokeWidth={1}
              />

              {/* Review Content */}
              <p className="relative z-10 mt-2 flex-1 text-sm leading-7 text-muted-foreground">
                &quot;{testimonial.content}&quot;
              </p>

              {/* User Info */}
              <div className="mt-8 flex items-center gap-4">
                {/* Premium Initials Avatar (Updated to match the feature card's crisp border) */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary border border-border shadow-sm">
                  <span className="text-sm font-bold tracking-wider text-secondary-foreground">
                    {testimonial.initials}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold tracking-tight text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <BadgeCheck
                      className="size-4 text-emerald-500"
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
