import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { ThemeToggle } from "@/src/components/ui/Theme-toggle";
import { AnimatedLogo } from "./animated-logo";

type LandingNavbarProps = {
  action: {
    href: string;
    label: string;
  };
};

export function LandingNavbar({ action }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        {/* LEFT */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="h-6 w-6">
            <AnimatedLogo />
          </div>

          <span className="text-sm font-semibold">
            T<sub>1</sub> Classes
          </span>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {action && (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
