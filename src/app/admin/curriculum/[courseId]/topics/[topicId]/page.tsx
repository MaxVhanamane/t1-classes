import { Separator } from "@/src/components/ui/separator";
import { Inbox } from "lucide-react";
import { getUnitsByTopic } from "../../_features/actions/get-course-units-by-topic";
import { AddVideoDialog } from "../../_features/components/video/add-video-dialog";
import { AddPdfDialog } from "../../_features/components/pdf/add-pdf-dialog";
import { TopicUnitItem } from "../../_features/components/topic/topic-unit-item";
import { getPracticeSetsByTopic } from "./practice/[practiceSetId]/actions/practice-set/get-practice-sets-by-topic";
import { Suspense } from "react";
import { PracticeSetSection } from "./components/practice-set/practice-set-section";
import { PracticeSetSkeleton } from "./components/skeleton/practice-set-skeleton";
import { PracticeSetDialog } from "./components/practice-set/practice-set-dialog";

interface PageProps {
  params: Promise<{ courseId: string; topicId: string }>;
  searchParams: Promise<{ title?: string }>;
}
export default async function TopicContentPage({
  params,
  searchParams,
}: PageProps) {
  const { topicId, courseId } = await params;
  const { title } = await searchParams;

  const units = await getUnitsByTopic(topicId);
  const practiceSets = await getPracticeSetsByTopic(topicId);

  const hasContent = units.length > 0 || practiceSets.length > 0;

  return (
    <div className="space-y-6">
      {/* Debug */}
      <pre className="text-sm text-muted-foreground">Title: {title}</pre>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Topic content</h1>
          <p className="text-sm text-muted-foreground">
            Manage videos, PDFs, and practice material for this topic
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <AddVideoDialog topicId={topicId} courseId={courseId} />
          <AddPdfDialog topicId={topicId} courseId={courseId} />
          <PracticeSetDialog topicId={topicId} courseId={courseId} />
        </div>
      </div>

      <Separator />

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium">No content added yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add videos, PDFs, or practice material for this topic.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Videos + PDFs */}
          {units.map((unit) => (
            <TopicUnitItem
              key={unit.id}
              unit={unit}
              courseId={courseId}
              topicId={topicId}
            />
          ))}

          <Suspense fallback={<PracticeSetSkeleton />}>
            <PracticeSetSection topicId={topicId} courseId={courseId} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
