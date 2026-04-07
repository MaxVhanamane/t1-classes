import AdminHeader from "./header";
import { getUserProfile } from "@/src/lib/auth/get-user-profile";
import { redirect } from "next/navigation";

export default async function AdminHeaderWrapper() {
  const user = await getUserProfile();

  if (user.role !== "admin") {
    redirect("/login");
  }

  return <AdminHeader userName={user.full_name} />;
}
