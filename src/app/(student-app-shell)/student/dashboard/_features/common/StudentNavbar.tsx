"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { useParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "@/src/components/ui/Theme-toggle";
import { UserMenu } from "@/src/components/ui/user/user-menu";

export function StudentNavbar() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b bg-background backdrop-blur"
    >
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        {/* Left: Logo */}
        <div className="flex gap-2 items-center">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="Imperial classes"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="hidden text-sm font-semibold sm:inline">
              Imperial Classes
            </span>
          </Link>
          <p
            className={cn(
              slug && "border-l px-2 text-sm  line-clamp-1 max-w-65 lg:max-w-md"
            )}
          >
            {slug && decodeURIComponent(slug)}
          </p>
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="hidden sm:inline-flex h-9 px-3"
          >
            <Link href="/dashboard">My Learning</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="hidden sm:inline-flex h-9 px-3"
          >
            <Link href="/courses">Explore</Link>
          </Button>

          <ThemeToggle />

          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}
