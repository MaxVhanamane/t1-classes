import { redirect } from "next/navigation";
import AdminShell from "@/src/components/ui/admin/admin-shell";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: appUser } = await supabase
    .from("users")
    .select("role, status, full_name")
    .eq("id", user.id)
    .single();

  if (!appUser || appUser.role !== "admin" || appUser.status !== "active") {
    redirect("/unauthorized");
  }

  return <AdminShell userName={appUser.full_name}>{children}</AdminShell>;
}
