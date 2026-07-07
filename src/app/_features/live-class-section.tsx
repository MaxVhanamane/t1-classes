"use client";

import { MessageCircle, Video, PlayCircle } from "lucide-react";
import { MobileLandscapePreview } from "./mobile-landscape-preview";
import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";

const points = [
  {
    icon: Video,
    title: "Targeted Live Sessions",
    description:
      "No unnecessary daily lectures. Teachers schedule live classes specifically for deep-dives, hard concepts, and intensive problem-solving.",
  },
  {
    icon: MessageCircle,
    title: "Live Doubt Resolution",
    description:
      "Stuck on a tough concept? Drop your question in the live chat and get it cleared instantly by the teacher before the class ends.",
  },
  {
    icon: PlayCircle,
    title: "Automatic Recordings",
    description:
      "Every live session is automatically recorded and saved in your batch dashboard so you can rewatch and revise whenever you want.",
  },
];

export function LiveClassesSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Targeted Live Classes
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl leading-[1.08]">
            Interactive live learning.
            <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              Scheduled exactly when you need it.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
            We value your time. Instead of generic daily lectures, teachers
            schedule live classes specifically for complex topics and
            interactive doubt-clearing. Just open the app and join.
          </p>
        </div>

        {/* ── Image ── */}
        <div className="relative mx-auto max-w-5xl">
          <div className="hidden rounded-3xl sm:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-muted p-3 backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/8 to-transparent"
              />
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background ">
                <MobileLandscapePreview
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/live-classes.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/live-classes-4.3.webp"
                  alt="T1 Classes live class — teacher explaining with live student chat"
                  width={1400}
                  height={788}
                  mobileWidth={1200}
                  mobileHeight={900}
                  priority
                  className="block w-full"
                />
              </div>
            </div>
          </div>
          {/* Mobile */}
          <div className="sm:hidden">
            <div
              className="relative rounded-md p-px"
              style={{
                background:
                  "linear-gradient(180deg, rgba(113,113,122,.32), rgba(161,161,170,.14) 35%, rgba(161,161,170,.06) 70%, rgba(113,113,122,.24))",
              }}
            >
              {/* soft glass highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-md bg-linear-to-b from-white/60 via-transparent to-transparent dark:from-white/10" />

              <div className="overflow-hidden rounded-md border border-zinc-300/60 dark:border-white/10 bg-background">
                <MobileLandscapePreview
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/live-classes.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/live-classes-4.3.webp"
                  alt="T1 Classes live class — teacher explaining with live student chat"
                  width={1400}
                  height={788}
                  mobileWidth={1200}
                  mobileHeight={900}
                  priority
                  className="block w-full"
                />
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-24 -bottom-8 -z-10 hidden h-20 rounded-full bg-black/10 blur-3xl sm:block"
          />
        </div>
        {/* ── 3 points ── */}
        <div className="grid gap-3 sm:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <Card
                key={point.title}
                className="group relative overflow-hidden rounded-xl py-2 shadow-sm transition-shadow bg-muted-soft"
              >
                <DottedBackground className="opacity-50" />

                {/* Subtle top glows matching the previous cards */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

                <CardContent className="relative flex h-full flex-col p-6 gap-4">
                  {/* Icon Box */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10 shadow-sm">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>

                  {/* Text Content */}
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {point.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
