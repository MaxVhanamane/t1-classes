import { BackButton } from "@/src/components/ui/navigation/back-button";
import { MobileSwitch } from "./_features/components/structure/mobile-switch";
import { Suspense } from "react";
import { StructureTreeLoader } from "./_features/components/structure/structure-tree.server";
import { StructureTreeSkeleton } from "./_features/components/skeletons/structure-tree-skeleton";

interface Props {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function CurriculumLayout({ children, params }: Props) {
  const { courseId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-3">
        <BackButton />
        <h1 className="text-lg font-semibold">Course Curriculum</h1>
      </div>

      {/* DESKTOP */}
      <div className="hidden 2xl:grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Suspense fallback={<StructureTreeSkeleton />}>
            <StructureTreeLoader courseId={courseId} />
          </Suspense>
        </div>

        <div className="col-span-8 rounded-md border p-4">{children}</div>
      </div>

      {/* MOBILE */}
      <MobileSwitch
        structure={
          <Suspense fallback={<StructureTreeSkeleton />}>
            <StructureTreeLoader courseId={courseId} />
          </Suspense>
        }
      >
        {children}
      </MobileSwitch>
    </div>
  );
}
