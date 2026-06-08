"use client";

import { TARGET_EXAM_LABELS } from "@/src/app/admin/batches/_features/zod-schema/schema";

type AttachmentManagementHeaderProps = {
  title: string;

  classLevel: number | null;

  targetExam: string | null;
};

export function AttachmentManagementHeader({
  title,
  classLevel,
  targetExam,
}: AttachmentManagementHeaderProps) {
  const metadata: string[] = [];

  if (classLevel) {
    metadata.push(`Class ${classLevel}`);
  }

  if (targetExam) {
    metadata.push(
      TARGET_EXAM_LABELS[targetExam as keyof typeof TARGET_EXAM_LABELS] ??
        targetExam,
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>

        {metadata.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {metadata.join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
}
