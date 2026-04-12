"use client";

import { usePathname } from "next/navigation";

export function DesktopSwitch({
  structure,
  children,
}: {
  structure: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPracticeRoute = pathname.includes("/practice/");

  if (isPracticeRoute) {
    return (
      <div className="hidden 2xl:block">
        <div className="rounded-md border p-4">{children}</div>
      </div>
    );
  }

  return (
    <div className="hidden 2xl:grid grid-cols-12 gap-6">
      <div className="col-span-4">{structure}</div>
      <div className="col-span-8 rounded-md border p-4">{children}</div>
    </div>
  );
}
