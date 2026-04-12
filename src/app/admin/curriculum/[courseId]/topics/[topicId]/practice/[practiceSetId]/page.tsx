import { Separator } from "@/src/components/ui/separator";

import { getPracticeSetById } from "./actions/practice-set/get-practice-set-by-id";
import { getPracticeQuestionsByPracticeSet } from "./actions/practice-set/get-practice-questions";
import { PracticeSetClient } from "../../components/practice-set/practice-set-client";

interface PageProps {
  params: Promise<{
    courseId: string;
    topicId: string;
    practiceSetId: string;
  }>;
}

/* -------------------------------------------------------------------------- */
/* Server Page                                                                */
/* -------------------------------------------------------------------------- */
export default async function PracticeSetPage({ params }: PageProps) {
  const { courseId, topicId, practiceSetId } = await params;

  const [practiceSet, questions] = await Promise.all([
    getPracticeSetById(practiceSetId),
    getPracticeQuestionsByPracticeSet(practiceSetId),
  ]);

  return (
    <div className="space-y-6 xl:w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">{practiceSet.title}</h1>
        {practiceSet.description && (
          <p className="text-sm text-muted-foreground">
            {practiceSet.description}
          </p>
        )}
      </div>

      <Separator />

      {/* Client Component */}
      <PracticeSetClient
        courseId={courseId}
        topicId={topicId}
        practiceSetId={practiceSetId}
        questions={questions}
      />
    </div>
  );
}
