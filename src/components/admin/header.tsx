"use client";

import { ThemeToggle } from "../ui/Theme-toggle";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import { UserMenu } from "../ui/user/user-menu";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-sidebar px-4 md:px-6 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-3">
        {/* 
          SidebarTrigger automatically handles the desktop collapse/expand 
          AND the mobile slide-out sheet. 
        */}
        <SidebarTrigger className="-ml-1" />

        {/* <span className="text-sm">
          Welcome, <strong>{userName}</strong>
        </span> */}
      </div>

      <div className="flex items-center justify-center gap-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
