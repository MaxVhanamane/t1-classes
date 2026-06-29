"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/src/components/ui/button";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-2 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-primary/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* ── TOP: Text + CTAs ── */}
        <div className="mx-auto max-w-3xl pt-12 text-center ">
          {/* Eyebrow */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/8 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400"
          >
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            JEE · NEET · Boards · Scholarships · Foundation
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 text-5xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.05]"
          >
            Built for students
            <span className="block mt-1 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              who want results
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Watch a concept, practice it immediately, test under real exam
            conditions, and get personal guidance when you&apos;re stuck, all in
            one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              onClick={() => {
                const element = document.getElementById("explore-category");

                if (element) {
                  const offset = 40; // pixels
                  const top =
                    element.getBoundingClientRect().top +
                    window.pageYOffset -
                    offset;

                  window.scrollTo({
                    top,
                    behavior: "smooth",
                  });
                }
              }}
              size="lg"
              className="h-12 w-fit rounded-xl px-8 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 border-0 shadow-lg shadow-amber-500/25 transition-all sm:w-auto"
            >
              Explore Courses & Batches
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>

          <motion.p
            custom={3.5}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-4 text-xs text-muted-foreground"
          >
            One platform for learning, practice, testing, and mentorship.
          </motion.p>

          {/* Stats row */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 flex items-center justify-center gap-3 pt-4 sm:gap-12"
          >
            <div className="text-center">
              <p className="text-3xl font-black text-amber-500">25K+</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Active students
              </p>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <div className="text-center">
              <p className="text-3xl font-black">1000+</p>
              <p className="mt-1 text-xs text-muted-foreground">Lessons</p>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <div className="text-center">
              <p className="text-3xl font-black">5000+</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Practice sets & tests
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM: Screenshot ── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="relative mx-auto mt-12 max-w-6xl px-3 sm:mt-16 sm:px-6 lg:mt-20"
        >
          {/* Ambient Glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-110 bg-[radial-gradient(circle_at_top,rgba(251,191,36,.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,.10),transparent_45%)] blur-3xl"
          />

          {/* Outer Frame */}
          <div
            className="relative rounded-xl p-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.08) 30%, rgba(255,255,255,.04) 65%, rgba(255,255,255,.14))",
              boxShadow:
                "0 32px 80px rgba(15,23,42,.10), 0 12px 32px rgba(15,23,42,.08)",
            }}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-background/75 p-2 backdrop-blur-2xl sm:p-3">
              {/* Inner Border */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"
              />

              {/* Soft Top Light */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/8 to-transparent"
              />

              {/* Screenshot */}
              <div className="relative overflow-hidden rounded-xl border border-black/5 bg-background shadow-[0_20px_50px_rgba(15,23,42,.12)] dark:border-white/10">
                <Image
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-ui.webp"
                  alt="T1 Classes test interface"
                  width={1536}
                  height={960}
                  priority
                  className="block h-auto w-full"
                />

                {/* Subtle Glass Highlight */}
              </div>
            </div>
          </div>

          {/* Ground Shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 -bottom-6 -z-10 h-16 rounded-full bg-black/10 blur-3xl sm:inset-x-24"
          />
        </motion.div>
      </div>

      {/* Bottom section padding */}
      {/* Bottom Fade */}
      <div
        aria-hidden
        className="pointer-events-none h-10 bg-linear-to-b from-transparent via-background/40 to-background"
      />
    </section>
  );
}
