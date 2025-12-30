import { Separator } from "@/src/components/ui/separator";
import { McqBuilder } from "../../components/practice-set/mcq-builder";
import { getPracticeSetById } from "../../actions/practice-set/get-practice-set-by-id";
import { getPracticeQuestionsByPracticeSet } from "../../actions/practice-set/get-practice-questions";
import { PracticeQuestionList } from "../../components/practice-set/practice-question-list";

interface PageProps {
  params: Promise<{
    courseId: string;
    topicId: string;
    practiceSetId: string;
  }>;
}

export default async function PracticeSetPage({ params }: PageProps) {
  const { courseId, topicId, practiceSetId } = await params;
  const questions = await getPracticeQuestionsByPracticeSet(practiceSetId);
  const practiceSet = await getPracticeSetById(practiceSetId);

  return (
    <div className="space-y-6">
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

      {/* MCQ Builder */}
      <McqBuilder
        courseId={courseId}
        topicId={topicId}
        practiceSetId={practiceSetId}
      />

      {/* Existing questions */}
      <PracticeQuestionList
        questions={questions}
        courseId={courseId}
        topicId={topicId}
        practiceSetId={practiceSetId}
      />
    </div>
  );
}
