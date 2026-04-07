import { JSONContent } from "@tiptap/react";
import { CheckCircle2 } from "lucide-react";
import { SectionDivider } from "../../../../../../../../components/ui/section-divider";
import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";
type Props = {
  description: JSONContent | null;
  target_audience?: string[] | null;
};

export function CourseDescriptionSection({
  description,
  target_audience,
}: Props) {
  return (
    <section>
      <div>
        <h2 className="text-2xl font-semibold mb-4">About This Course</h2>

        {description && (
          <div className="prose max-w-none text-sm sm:text-base">
            <RichTextHTMLContent variant="prose" content={description} />
          </div>
        )}
      </div>
      <SectionDivider />
      {target_audience && target_audience.length > 0 && (
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">
              Who This Course Is For
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Designed for learners who want structured guidance and
              exam-focused preparation.
            </p>
          </div>

          {/* Audience Grid */}
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {target_audience.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1 shrink-0 text-foreground/90">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed text-foreground/90">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
