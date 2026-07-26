"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { ThemeToggle } from "../ui/Theme-toggle";
import { SidebarTrigger } from "@/src/components/ui/sidebar";

const supabase = createBrowserSupabaseClient();

export default function AdminHeader() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
