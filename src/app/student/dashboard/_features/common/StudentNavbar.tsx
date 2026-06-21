"use client";

import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "@/src/components/ui/Theme-toggle";
import { UserMenu } from "@/src/components/ui/user/user-menu";
import dynamic from "next/dynamic";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { cleanupTestTimeStorage } from "@/src/lib/test/cleanup-test-time-storage";

const NotificationPopover = dynamic(
  () => import("./notification-popover").then((m) => m.NotificationPopover),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5 opacity-50" />
      </Button>
    ),
  },
);

const AnimatedLogo = dynamic(
  () =>
    import("@/src/app/student/dashboard/_features/common/animated-logo").then(
      (m) => m.AnimatedLogo,
    ),
  { ssr: false },
);

type NavbarVariant = "authenticated" | "marketing";

interface StudentNavbarProps {
  variant?: NavbarVariant;
}

export function StudentNavbar({
  variant = "authenticated",
}: StudentNavbarProps) {
  const pathname = usePathname();
  const isCoursePage = pathname.startsWith("/student/learn/courses/");
  const hideOnMobile = pathname.startsWith("/student/tests/attempt/");
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];
  const isApp = variant === "authenticated";

  useEffect(() => {
    cleanupTestTimeStorage();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background md:bg-background/60 backdrop-blur",

        hideOnMobile && "hidden min-[820px]:block",
      )}
    >
      <div className="flex h-14 items-center justify-between px-3 sm:px-7">
        {/* Left: Logo */}
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="w-6 h-6">
              <AnimatedLogo />
            </div>
            <span
              className={cn(
                "text-sm font-semibold",
                isCoursePage && "hidden sm:inline",
              )}
            >
              T<sub>1</sub> Classes
            </span>
          </Link>
          {isApp && (
            <p
              className={cn(
                slug &&
                  "border-l px-2 text-sm line-clamp-1 max-w-65 lg:max-w-md",
              )}
            >
              {slug && decodeURIComponent(slug)}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isApp ? (
            <>
              <ThemeToggle />
              <NotificationPopover />
              <UserMenu />
            </>
          ) : (
            <>
              <ThemeToggle />
              <UserMenu />
              {/* UserMenu handles both logged-in and logged-out states internally */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
