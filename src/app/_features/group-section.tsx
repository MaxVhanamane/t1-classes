"use client";

import DottedBackground from "@/src/components/dotted-background";
import { MobileLandscapePreview } from "./mobile-landscape-preview";
import { Trophy, Shield, Mic } from "lucide-react";

const points = [
  {
    icon: Trophy,
    title: "Learn how toppers think",
    description:
      "Not just what to study, but how to approach problems, manage time under pressure, and stay consistent when motivation drops.",
  },
  {
    icon: Mic,
    title: "Built for the real world too",
    description:
      "Group discussions, speaking confidently in front of others, articulating your thoughts clearly, skills every interview, and career moment demands.",
  },
  {
    icon: Shield,
    title: "Pressure-proof your mindset",
    description:
      "Exam day nerves, blank mind moments, overthinking etc. your teacher works through these with the group so when it matters, you're ready.",
  },
];

export function GroupSessionSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Group Sessions
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl leading-[1.15]">
            Better together,
            <span className="block mt-1 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              guided by your teacher.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Live video sessions for the whole batch or a selected group — to
            celebrate progress, fix patterns, or tackle a topic that needs
            everyone on the same page.
          </p>
        </div>

        {/* ── Image ── */}
        <div className="relative mx-auto max-w-5xl">
          {/* Desktop frame */}
          <div
            className="hidden rounded-xl p-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.08) 35%, rgba(255,255,255,.03) 70%, rgba(255,255,255,.14))",
            }}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-background/75 p-3 backdrop-blur-xl lg:p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/8 to-transparent"
              />
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-[0_24px_70px_rgba(15,23,42,.12)]">
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
              <div
                key={point.title}
                className="rounded-2xl border border-border/50 bg-muted-soft p-6 flex flex-col gap-4 relative"
              >
                <DottedBackground />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
                  <Icon className="size-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {point.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
