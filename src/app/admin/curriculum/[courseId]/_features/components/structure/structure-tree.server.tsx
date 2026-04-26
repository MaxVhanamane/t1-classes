import { getChapters } from "../../actions/get-chapters";
import { getTopicsByChapter } from "../../actions/get-topics-by-chapter";
import { Chapter } from "../../types/course-structure.ui.types";
import { StructureTree } from "./structure-tree";

export async function StructureTreeLoader({ courseId }: { courseId: string }) {
  const chapterRows = await getChapters(courseId);

  const chapters: Chapter[] = await Promise.all(
    chapterRows.map(async (chapter) => {
      const topics = await getTopicsByChapter(chapter.id);
      return {
        id: chapter.id,
        title: chapter.title,
        is_published: chapter.is_published,
        sort_order: chapter.sort_order,
        topics,
      };
    }),
  );

  return <StructureTree courseId={courseId} chapters={chapters} />;
}
