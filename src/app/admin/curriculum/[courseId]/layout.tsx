import { BackButton } from "@/src/components/ui/navigation/back-button";
import { MobileSwitch } from "./_features/components/structure/mobile-switch";
import { Suspense } from "react";
import { StructureTreeLoader } from "./_features/components/structure/structure-tree.server";
import { StructureTreeSkeleton } from "./_features/components/skeletons/structure-tree-skeleton";
import { DesktopSwitch } from "./_features/components/structure/desktop-switch";

interface Props {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function CurriculumLayout({ children, params }: Props) {
  const { courseId } = await params;

  const structure = (
    <Suspense fallback={<StructureTreeSkeleton />}>
      <StructureTreeLoader courseId={courseId} />
    </Suspense>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3 border-b pb-3">
        <BackButton />
        <h1 className="text-lg font-semibold">Course Curriculum</h1>
      </div>

      {/* DESKTOP */}
      <DesktopSwitch structure={structure}>{children}</DesktopSwitch>

      {/* MOBILE */}
      <MobileSwitch structure={structure}>{children}</MobileSwitch>
    </div>
  );
}
