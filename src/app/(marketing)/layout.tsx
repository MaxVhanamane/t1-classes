import { StudentNavbar } from "../(student-app-shell)/student/dashboard/_features/common/StudentNavbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StudentNavbar variant="marketing" />
      {children}
    </>
  );
}
