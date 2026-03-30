"use client";

import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import { useParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "@/src/components/ui/Theme-toggle";
import { UserMenu } from "@/src/components/ui/user/user-menu";
import dynamic from "next/dynamic";
import { Bell } from "lucide-react";

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
  () => import("./animated-logo").then((m) => m.AnimatedLogo),
  { ssr: false },
);

type NavbarVariant = "authenticated" | "marketing";

interface StudentNavbarProps {
  variant?: NavbarVariant;
}

export function StudentNavbar({
  variant = "authenticated",
}: StudentNavbarProps) {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];

  const isApp = variant === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        {/* Left: Logo */}
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="w-6 h-6">
              <AnimatedLogo />
            </div>
            <span className=" text-sm font-semibold">
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
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex h-9 px-3"
              >
                <Link href="/student/dashboard">My Learning</Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex h-9 px-3"
              >
                <Link href="/courses">Explore</Link>
              </Button>

              <ThemeToggle />
              <NotificationPopover />
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex h-9 px-3"
              >
                <Link href="/courses">Explore</Link>
              </Button>

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

{
  /* <svg
                viewBox="0 0 420 380"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="w-full h-full"
              >
                <polygon
                  points="210,20 390,350 30,350"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeLinejoin="round"
                  className="dark:fill-white fill-black"
                />

                <text
                  x="210"
                  y="240"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Montserrat, Arial, Helvetica, sans-serif"
                  fontSize="85"
                  fontWeight="800"
                  className="dark:fill-black fill-white"
                >
                  T1
                </text>
              </svg> */
}
{
  /* <svg
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="w-full h-full"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="170"
                  stroke="currentColor"
                  strokeWidth="14"
                />

                <text
                  x="200"
                  y="210"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Montserrat, Arial, Helvetica, sans-serif"
                  fontSize="110"
                  fontWeight="800"
                  fill="currentColor"
                >
                  T1
                </text>
              </svg> */
}

// animate from top
//   const pathD = `
//   M210 30
//   Q225 60 240 90
//   L380 330
//   Q385 345 360 350
//   L245 350
//   L245 290
//   L175 290
//   L175 350
//   L60 350
//   Q35 345 40 330
//   L180 90
//   Q195 60 210 30
//   Z
// `;

//   {/* Draw outline */}
//                 <motion.path
//                   d={pathD}
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="6"
//                   initial={{ pathLength: 0 }}
//                   animate={{ pathLength: 1 }}
//                   transition={{
//                     duration: 1.4,
//                     ease: [0.65, 0, 0.35, 1], // smooth premium ease
//                   }}
//                 />

//                 {/* Fill after draw */}
//                 <motion.path
//                   d={pathD}
//                   className="dark:fill-white fill-black"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ delay: 1.2, duration: 0.4 }}
//                 />
//               </motion.svg>
