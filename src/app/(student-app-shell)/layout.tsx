import { requireStudent } from "@/src/lib/helper-functions/requireStudent";
import { StudentNavbar } from "./student/dashboard/_features/common/StudentNavbar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentAppShellLayout({
  children,
}: StudentLayoutProps) {
  await requireStudent();

  return (
    <>
      <StudentNavbar />
      {children}
    </>
  );
}
