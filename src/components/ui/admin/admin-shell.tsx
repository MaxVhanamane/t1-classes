import AdminSidebarToggle from "./admin-sidebar-toggle";

export default function AdminShell({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted-soft">
      <AdminSidebarToggle>
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="relative">{header}</div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </AdminSidebarToggle>
    </div>
  );
}
