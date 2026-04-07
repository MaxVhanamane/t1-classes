import AdminShell from "@/src/components/ui/admin/admin-shell";
import AdminHeaderWrapper from "@/src/components/ui/admin/admin-header-wrapper";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminShell
        header={
          <Suspense fallback={<div className="h-14 bg-sidebar border-b" />}>
            <AdminHeaderWrapper />
          </Suspense>
        }
      >
        {children}
      </AdminShell>
    </Suspense>
  );
}
