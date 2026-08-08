"use client";

import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import { SidebarInset } from "@/src/components/ui/sidebar";
import { UserRole } from "@/src/lib/auth/types/auth.types";

export default function AdminShell({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: UserRole;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted-soft">
      {/* Pass the authenticated userRole to the sidebar */}
      <AdminSidebar userRole={userRole} />

      <SidebarInset className="flex flex-1 flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto bg-muted-soft">{children}</main>
      </SidebarInset>
    </div>
  );
}
