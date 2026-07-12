import { CheckCircle } from "lucide-react";
import { GridBackground } from "@/src/components/grid-background";
import { AnimatedLogo } from "../student/dashboard/_features/common/animated-logo";
import LoginForm from "./_features/components/login-form";
import { LandingNavbar } from "../student/dashboard/_features/common/LandingNavbar";

export default function LoginPage() {
  return (
    <main>
      <LandingNavbar action={{ href: "/", label: "Home" }} />

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background 2xl:px-10">
        <div className="hidden md:flex flex-col justify-center px-14 lg:px-20">
          <div className="max-w-md space-y-6 pt-4">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              Strong concepts.
              <br /> Better exam results.
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed">
              Jump back into your preparation. Revise concepts, clear your
              doubts in live sessions, and take practice tests that actually
              feel like the real exam.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              {[
                "Real exam interface",
                "Deep test analytics",
                "Live doubt clearing",
                "Topic-wise practice",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {item}
                </div>
              ))}
            </div>

            <div className="pt-8 hidden md:block">
              <picture>
                {/* 1. Only load this SVG on screens 768px (md) or wider */}
                <source
                  media="(min-width: 768px)"
                  srcSet={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/assets/school.svg`}
                />

                {/* 2. Fallback for mobile: A tiny transparent pixel that doesn't trigger a network request */}
                <img
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  alt="Learning illustration"
                  width={350}
                  height={350}
                  // Keep it hidden visually just in case
                  className="hidden md:block"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* ---------------- Right: Login Card ---------------- */}
        <div className="flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl text-card-foreground bg-background  border border-border relative z-10 overflow-hidden">
            {/* Top glow */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 
      bg-linear-to-b from-gray-400/15 via-gray-400/5 to-transparent 
      dark:from-gray-300/50 dark:via-gray-300/5 blur-2xl rounded-2xl"
            />

            {/* Border glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset 
      ring-gray-400/10 dark:ring-gray-300/15"
            />

            <GridBackground className="rounded-2xl opacity-40" />

            <div className="flex flex-col items-center pt-10 pb-2 space-y-2 z-10 relative">
              <div className="w-15 h-15">
                <AnimatedLogo />
              </div>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
