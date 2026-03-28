import { JSONContent } from "@tiptap/react";
import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";

export function BatchDescriptionSection({
  description,
}: {
  description: JSONContent | null;
  learning_outcomes?: string[] | null;
}) {
  return (
    <section className="space-y-8">
      <div>
        {/* Header */}
        <div className="space-y-5">
          {/* Eyebrow */}
          <div className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Program Overview
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            About This Batch
          </h2>
        </div>

        {description && (
          <div className="prose max-w-none text-sm sm:text-base">
            <RichTextRenderer variant="prose" content={description} />
          </div>
        )}
      </div>
    </section>
  );
}
