import AdminShell from "@/src/components/admin/admin-shell";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export default async function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authenticate & require STAFF (Admin or Teacher)
  const user = await requireStaffServerOnly();

  // 2. Render shell with user role
  return <AdminShell userRole={user.role}>{children}</AdminShell>;
}
