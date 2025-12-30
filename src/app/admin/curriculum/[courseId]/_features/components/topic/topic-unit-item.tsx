"use client";

import { CourseUnit } from "../../types/course-unit.types";
import { VideoItem } from "../video/video-item";
import { PdfItem } from "../pdf/pdf-item";

interface Props {
  unit: CourseUnit;
  courseId: string;
  topicId: string;
}

export function TopicUnitItem({ unit, courseId, topicId }: Props) {
  switch (unit.unit_type) {
    case "video":
      return <VideoItem video={unit} courseId={courseId} topicId={topicId} />;

    case "pdf":
      return <PdfItem pdf={unit} courseId={courseId} topicId={topicId} />;

    default:
      return (
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          Unsupported content type
        </div>
      );
  }
}
