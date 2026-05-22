import Image from "next/image";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* glow */}
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-14 pt-10 md:pt-16 lg:flex-row lg:items-center lg:gap-20 lg:pt-24">
          {/* LEFT */}
          <div className="flex-1">
            {/* badge */}
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-xl">
              Trusted by thousands of students
            </div>

            {/* heading */}
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl md:text-6xl ">
              Built for students
              <span className="block bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                who want to improve consistently.
              </span>
            </h1>

            {/* description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Courses, live classes, practice sets, and exam-level tests
              designed to help students learn effectively and stay consistent.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            {/* stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-8">
              <div>
                <p className="text-2xl font-black sm:text-3xl">25K+</p>

                <p className="mt-1 text-sm text-muted-foreground">Learners</p>
              </div>

              <div>
                <p className="text-2xl font-black sm:text-3xl">120+</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Practice Sets
                </p>
              </div>

              <div>
                <p className="text-2xl font-black sm:text-3xl">1000+</p>

                <p className="mt-1 text-sm text-muted-foreground">Lessons</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex-1">
            {/* glow */}
            <div className="absolute inset-0 rounded-[2rem] bg-primary/10 blur-3xl" />

            {/* dashboard */}
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 shadow-2xl backdrop-blur-xl">
              <Image
                src="/images/dashboard-preview.webp"
                alt="T1 Classes Dashboard"
                width={1400}
                height={1000}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
