"use client";

import { Menu, LogOut } from "lucide-react";
import { Button } from "../button";
import { createClient } from "@/src/lib/supabase/supabase-client";

const supabase = createClient();

export default function AdminHeader({
  userName,
  onMenuClick,
}: {
  userName: string;
  onMenuClick: () => void;
}) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-sidebar px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-sm">
          Welcome, <strong>{userName}</strong>
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4 " />
        Logout
      </Button>
    </header>
  );
}
