import { Suspense } from "react";
import { StudentNavbar } from "./dashboard/_features/common/StudentNavbar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentAppShellLayout({
  children,
}: StudentLayoutProps) {
  return (
    <>
      <Suspense fallback={null}>
        <StudentNavbar />
      </Suspense>
      {children}
    </>
  );
}
