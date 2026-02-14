import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";

type MetaProps = {
  subjectLabel?: string;
  questionCount?: number;
  fullMarks?: number;
  negativeMarks?: number;
  partialMarks?: PartialMarkingByCorrectCount | null | undefined;
  currentPage: number;
  totalPages: number;
};

export function MetaStrip({
  subjectLabel,
  questionCount,
  fullMarks,
  negativeMarks,
  partialMarks,
  currentPage,
  totalPages,
}: MetaProps) {
  return (
    <div className="flex flex-wrap items-center text-xs text-muted-foreground">
      {subjectLabel && (
        <>
          <span>{subjectLabel}</span>
          <span className="mx-2">•</span>
        </>
      )}

      {questionCount !== undefined && (
        <>
          <span>
            Questions{" "}
            <span className="text-foreground font-medium">{questionCount}</span>
          </span>
          <span className="mx-2">•</span>
        </>
      )}

      {fullMarks !== undefined && (
        <>
          <span>
            Marks{" "}
            <span className="text-foreground font-medium">+{fullMarks}</span>
          </span>
          <span className="mx-2">•</span>
        </>
      )}

      {negativeMarks !== undefined && negativeMarks !== 0 && (
        <>
          <span>
            Neg{" "}
            <span className="text-foreground font-medium">{negativeMarks}</span>
          </span>
          {partialMarks && <span className="mx-2">•</span>}
        </>
      )}

      {partialMarks && (
        <>
          <span>
            Partial <span className="text-foreground font-medium">Yes</span>
          </span>
          {totalPages > 1 && <span className="mx-2">•</span>}
        </>
      )}

      {totalPages > 1 && (
        <span>
          Page{" "}
          <span className="text-foreground font-medium">
            {currentPage}/{totalPages}
          </span>
        </span>
      )}
    </div>
  );
}
