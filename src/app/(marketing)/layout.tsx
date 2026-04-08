import { Suspense } from "react";
import { StudentNavbar } from "../student/dashboard/_features/common/StudentNavbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <StudentNavbar variant="marketing" />
      </Suspense>
      {children}
    </>
  );
}
