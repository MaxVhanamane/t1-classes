"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export function MobileSwitch({
  structure,
  children,
}: {
  structure: React.ReactNode;
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  /**
   * segment === null  → /curriculum
   * segment === "topics" → /curriculum/topics/[id]
   */

  return (
    <div className="2xl:hidden">{segment === null ? structure : children}</div>
  );
}
