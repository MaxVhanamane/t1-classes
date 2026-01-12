import AdminShell from "@/src/components/ui/admin/admin-shell";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdmin();

  return <AdminShell userName={user.full_name}>{children}</AdminShell>;
}
