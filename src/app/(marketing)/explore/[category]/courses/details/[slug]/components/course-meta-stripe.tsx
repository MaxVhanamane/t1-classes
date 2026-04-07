import { Badge } from "@/src/components/ui/badge";
import { CourseDetails } from "../types/course-details.types";
type Props = {
  course: CourseDetails;
};

export function CourseMetaStrip({ course }: Props) {
  return (
    <div className="flex flex-wrap gap-2 ">
      {course.classLevel && (
        <Badge variant="outline">Class {course.classLevel}</Badge>
      )}

      {course.board && <Badge variant="outline">{course.board}</Badge>}

      {course.subjects?.map((subject) => (
        <Badge key={subject} variant="outline">
          {subject}
        </Badge>
      ))}
    </div>
  );
}
