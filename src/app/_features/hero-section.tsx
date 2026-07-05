// React Server Components (Next.js etc)
import * as motion from "motion/react-client";

import { MobileLandscapePreview } from "./mobile-landscape-preview";
import { ExploreCoursesButton } from "./explore-courses-button";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

export function HeroSection() {
  return (
    <section className="relative px-2.5 sm:px-6 lg:px-8">
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
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="mx-auto max-w-3xl pt-8 md:pt-12 text-center"
        >
          {/* Eyebrow */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/8 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400"
          >
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            JEE · NEET · Boards · Scholarships · Foundation
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="mt-6 text-5xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.05]"
          >
            Built for students
            <span className="block mt-1 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              who want results
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Watch a concept, practice it immediately, test under real exam
            conditions, and get personal guidance when you&apos;re stuck, all in
            one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <ExploreCoursesButton />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-xs text-muted-foreground"
          >
            One platform for learning, practice, testing, and mentorship.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
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
        </motion.div>

        {/* ── BOTTOM: Screenshot ── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="relative mx-auto mt-12 max-w-6xl px-0 sm:mt-16 sm:px-6 lg:mt-20"
        >
          {/* Ambient Glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-110 bg-[radial-gradient(circle_at_top,rgba(251,191,36,.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,.10),transparent_45%)] blur-3xl"
          />

          {/* Desktop Premium Frame */}
          <div
            className="hidden rounded-xl p-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.08) 30%, rgba(255,255,255,.04) 65%, rgba(255,255,255,.14))",
              boxShadow:
                "0 32px 80px rgba(15,23,42,.10), 0 12px 32px rgba(15,23,42,.08)",
            }}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-background/75 p-3 backdrop-blur-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/8 to-transparent"
              />

              <div className="relative overflow-hidden rounded-xl border border-black/5 bg-background shadow-[0_20px_50px_rgba(15,23,42,.12)] dark:border-white/10">
                <MobileLandscapePreview
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-ui.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-ui-4.3.webp"
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
                  src="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-ui.webp"
                  mobileSrc="https://pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev/assets/test-ui-4.3.webp"
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
          {/* Ground Shadow (desktop only) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-24 -bottom-6 -z-10 hidden h-16 rounded-full bg-black/10 blur-3xl sm:block"
          />
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div
        aria-hidden
        className="pointer-events-none h-10 bg-linear-to-b from-transparent via-background/40 to-background"
      />
    </section>
  );
}
