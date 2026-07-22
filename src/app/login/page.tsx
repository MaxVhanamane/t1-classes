import { CheckCircle } from "lucide-react";
import { AnimatedLogo } from "../student/dashboard/_features/common/animated-logo";
import LoginForm from "./_features/components/login-form";
import { LandingNavbar } from "../student/dashboard/_features/common/LandingNavbar";
import { PremiumLines } from "@/src/components/animated-lines";
import DottedBackground from "@/src/components/dotted-background";

export default function LoginPage() {
  return (
    <main className="h-screen flex flex-col">
      <LandingNavbar action={{ href: "/", label: "Home" }} />

      {/* 1. Added min-h-0 so the Grid doesn't force height overflow */}
      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 bg-background 2xl:px-10 py-6">
        {/* 2. Added min-h-0 and scaled down padding on left column */}
        <div className="hidden md:flex flex-col justify-center min-h-0 px-14 lg:px-20">
          <div className="max-w-md space-y-4 pt-2">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              Strong concepts.
              <br /> Better exam results.
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed">
              Jump back into your preparation. Revise concepts, clear your
              doubts in live sessions, and take practice tests that actually
              feel like the real exam.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
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

            <div className="pt-4 hidden md:block">
              <picture>
                <source
                  media="(min-width: 768px)"
                  srcSet={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/assets/school.svg`}
                />
                <img
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  alt="Learning illustration"
                  width={280}
                  height={280}
                  className="hidden md:block max-h-[30vh] w-auto object-contain"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* ---------------- Right: Login Card ---------------- */}
        <div className="flex items-center justify-center min-h-0 px-4 py-4">
          <div className="w-full max-w-sm rounded-2xl text-card-foreground bg-background border border-border relative z-10 overflow-hidden ring-white/10 dark:ring-white/10 py-2">
            <DottedBackground className="opacity-40" />
            {/* 1. DARK MODE TOP GLOW */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 blur-2xl hidden dark:block bg-linear-to-b from-cyan-300/50 via-cyan-300/5 to-transparent" />

            {/* 2. BORDER GLOW */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl dark:ring-1 dark:ring-inset dark:ring-cyan-300/15" />

            {/* 3. LIGHT MODE GRADIENT */}
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-cyan-500/5 dark:hidden" />
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset 
              ring-gray-400/10 dark:ring-gray-300/15"
            />

            <PremiumLines className="opacity-80" />

            <div className="flex flex-col items-center pt-8 pb-2 space-y-2 z-10 relative">
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
