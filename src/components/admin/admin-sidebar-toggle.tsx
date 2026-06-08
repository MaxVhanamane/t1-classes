"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./sidebar";

export default function AdminSidebarToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="relative">
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 md:hidden z-50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {children}
        </div>
      </div>
    </>
  );
}
