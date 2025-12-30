import { Separator } from "@/src/components/ui/separator";
import { PracticeSetItem } from "./practice-set-item";
import { getPracticeSetsByTopic } from "../../actions/practice-set/get-practice-sets-by-topic";
import { ClipboardList } from "lucide-react";
import { PracticeSetDialog } from "./practice-set-dialog";

export async function PracticeSetSection({
  topicId,
  courseId,
}: {
  topicId: string;
  courseId: string;
}) {
  const practiceSets = await getPracticeSetsByTopic(topicId);

  if (practiceSets.length === 0) {
    return (
      <>
        <Separator />
        <div className="flex justify-center py-4">
          <div className="flex w-full items-center gap-4 rounded-md border border-dashed px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold">No practice set yet</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Practice questions are optional, but they can help students
                check their understanding after watching videos or reading
                notes.
              </p>
            </div>

            <PracticeSetDialog
              mode="create"
              courseId={courseId}
              topicId={topicId}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Separator />
      <div className="space-y-2">
        {practiceSets.map((ps) => (
          <PracticeSetItem
            key={ps.id}
            practiceSet={ps}
            courseId={courseId}
            topicId={topicId}
          />
        ))}
      </div>
    </>
  );
}
