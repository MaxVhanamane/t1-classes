import { notFound } from "next/navigation";
import { getTestById } from "./_features/server/get-test-by-id";
import { TestBuilderHeader } from "./_features/components/test-builder-header";
import { SectionsEmptyState } from "./_features/components/section/sections-empty-state";
import { getTestSections } from "./_features/server/sections/get-test-sections";
import { TestSectionsList } from "./_features/components/section/Test-section-list";

type Props = {
  params: Promise<{ testId: string }>;
};

export default async function TestBuilderPage({ params }: Props) {
  const { testId } = await params;

  let test;
  try {
    test = await getTestById(testId);
  } catch {
    notFound();
  }
  const sections = await getTestSections(testId);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
      <TestBuilderHeader test={test} />

      {sections.length === 0 ? (
        <SectionsEmptyState
          testId={test.id}
          testType={test.test_type}
          isLocked={test.is_locked}
        />
      ) : (
        <TestSectionsList
          testId={test.id}
          testType={test.test_type}
          sections={sections}
          isLocked={test.is_locked}
        />
      )}
    </div>
  );
}
