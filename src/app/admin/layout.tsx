import { SidebarProvider } from "@/src/components/ui/sidebar";
import { Suspense } from "react";
import AdminAuthWrapper from "./admin-auth-wrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AdminAuthWrapper>{children}</AdminAuthWrapper>
      </Suspense>
    </SidebarProvider>
  );
}
