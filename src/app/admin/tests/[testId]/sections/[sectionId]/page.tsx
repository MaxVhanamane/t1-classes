import { notFound } from "next/navigation";
import { getSectionById } from "./_features/actions/get-section";
import { getQuestionsForSection } from "./_features/actions/get-questions";
import { SectionBuilderClient } from "./_features/components/section-builder-client";

type Props = {
  params: Promise<{
    testId: string;
    sectionId: string;
  }>;
};

export default async function SectionBuilderPage({ params }: Props) {
  const { testId, sectionId } = await params;

  let section;
  let questions;

  try {
    section = await getSectionById(testId, sectionId);
    questions = await getQuestionsForSection(sectionId);
  } catch {
    notFound();
  }

  return (
    <SectionBuilderClient
      testId={testId}
      section={section}
      questions={questions}
    />
  );
}
