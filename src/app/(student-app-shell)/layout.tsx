import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { StudentNavbar } from "./student/dashboard/_features/common/StudentNavbar";
import { ROLE_GROUPS } from "@/src/lib/auth/role-groups";
import { redirect } from "next/navigation";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentAppShellLayout({
  children,
}: StudentLayoutProps) {
  const student = getAuthIfHasRole(ROLE_GROUPS.STUDENT);
  if (!student) {
    redirect("/unauthorized");
  }

  return (
    <>
      <StudentNavbar />
      {children}
    </>
  );
}
