"use client";

import DottedBackground from "@/src/components/dotted-background";
import { MobileLandscapePreview } from "./mobile-landscape-preview";
import { Trophy, Shield, Mic } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";

const points = [
  {
    icon: Trophy,
    title: "The Topper's Mindset",
    description:
      "Go beyond the syllabus. Learn exactly how to approach complex problems, manage time under pressure, and stay consistent when motivation drops.",
  },
  {
    icon: Mic,
    title: "Communicate with Confidence",
    description:
      "Participate in active group discussions. Learn to articulate your thoughts clearly and build essential skills for future interviews and career milestones.",
  },
  {
    icon: Shield,
    title: "Pressure-Proof Your Strategy",
    description:
      "Overcome exam day nerves, blank moments, and overthinking. Your teacher works through these mental blocks with the group so you are fully prepared when it matters most.",
  },
];

export function GroupSessionSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Group Mentorship
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl leading-[1.08]">
            Master the mental game.
            <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              Guided by expert teachers.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
            Join live video sessions with your batch to discuss exam strategies,
            fix common mistakes, and build the confidence needed to tackle
            high-pressure situations.
          </p>
        </div>

        {/* ── Image ── */}
        <div className="relative mx-auto max-w-5xl">
          {/* Desktop frame */}
          <div className="hidden rounded-3xl p-px sm:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-muted p-3 backdrop-blur-xl ">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/8 to-transparent"
              />
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background">
                <MobileLandscapePreview
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/group-session.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/group-session-4.3.webp"
                  alt="T1 Classes group session — teacher with multiple students on a video call"
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
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/group-session.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/group-session-4.3.webp"
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

                {/* Subtle top glow */}
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
