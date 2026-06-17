import { Suspense } from "react";
import { StudentNavbar } from "./dashboard/_features/common/StudentNavbar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentAppShellLayout({
  children,
}: StudentLayoutProps) {
  return (
    <div className="select-none">
      <Suspense fallback={<div className="w-full h-[56.8px]"></div>}>
        <StudentNavbar />
      </Suspense>
      {children}
    </div>
  );
}
