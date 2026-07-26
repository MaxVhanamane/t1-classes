"use client";

import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import { SidebarInset } from "@/src/components/ui/sidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted-soft">
      {/* 
        Shadcn's Sidebar component automatically detects mobile via context.
        It renders as a standard sidebar on desktop, and a sliding Sheet + overlay on mobile.
      */}
      <AdminSidebar />

      <SidebarInset className="flex flex-1 flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto bg-muted-soft">{children}</main>
      </SidebarInset>
    </div>
  );
}
