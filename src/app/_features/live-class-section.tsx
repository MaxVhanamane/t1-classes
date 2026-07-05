"use client";

import { motion } from "motion/react";
import { MessageCircle, Video, PlayCircle } from "lucide-react";
import { MobileLandscapePreview } from "./mobile-landscape-preview";
import DottedBackground from "@/src/components/dotted-background";

const ease = [0.16, 1, 0.3, 1] as const;

const points = [
  {
    icon: Video,
    title: "Live when it matters",
    description:
      "Classes are scheduled by your teacher, focused sessions on topics that need real explanation, not filler.",
  },
  {
    icon: MessageCircle,
    title: "Ask questions live",
    description:
      "Type your doubt in the chat during class. Get it answered before the session ends,not the next day.",
  },
  {
    icon: PlayCircle,
    title: "Recording stays with you",
    description:
      "Every class is recorded and available in your batch. Rewatch any time, as many times as you need.",
  },
];

export function LiveClassesSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Live classes
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mt-5 text-4xl font-black tracking-tight sm:text-5xl leading-[1.08]"
          >
            The classroom experience
            <span className="block mt-1 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              wherever you are
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Every class is taught by your teacher in real time. Ask questions,
            get answers instantly, and replay every session whenever you need.
          </motion.p>
        </div>

        {/* ── Image ── */}
        <div className="relative mx-auto max-w-5xl">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="grid gap-3 sm:grid-cols-3"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
