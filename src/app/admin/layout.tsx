import AdminShell from "@/src/components/admin/admin-shell";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { Suspense } from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SidebarProvider>
        <AdminShell>{children}</AdminShell>
      </SidebarProvider>
    </Suspense>
  );
}
