import { Suspense } from "react";
import { StudentNavbar } from "./dashboard/_features/common/StudentNavbar";
import { PushRegistration } from "./_features/components/push-registration";

function StudentNavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background md:bg-background/60 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-3 sm:px-7">
        {/* Left */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse hidden sm:block" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </header>
  );
}

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentAppShellLayout({
  children,
}: StudentLayoutProps) {
  return (
    <div className="select-none">
      <PushRegistration />
      <Suspense fallback={<StudentNavbarSkeleton />}>
        <StudentNavbar />
      </Suspense>

      {children}
    </div>
  );
}
