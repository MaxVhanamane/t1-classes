import { notFound } from "next/navigation";
import { getSectionById } from "./_features/actions/get-section";
import { QuestionBuilderClient } from "./_features/components/question-builder-client";

type Props = {
  params: Promise<{
    testId: string;
    sectionId: string;
  }>;
};

export default async function SectionBuilderPage({ params }: Props) {
  const { testId, sectionId } = await params;

  let section;

  try {
    section = await getSectionById(testId, sectionId);
  } catch {
    notFound();
  }

  return <QuestionBuilderClient testId={testId} section={section} />;
}
