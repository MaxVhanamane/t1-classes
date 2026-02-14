import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

type PartialMarksRule = {
  marks: number;
  minCorrect: number;
};

type PartialMarks = {
  type: "by_correct_count";
  rules: PartialMarksRule[];
} | null;
type Props = {
  title: string;
  subjectLabel: string;
  answerMode: string;
  fullMarks: number;
  negativeMarks: number;
  partial_marks: PartialMarks;
  maxSelections: number | null;
  scoringQuestionCount: number | null;
  description: string | null;
};

function modeLabel(mode: string) {
  switch (mode) {
    case "single_select":
      return "Single Correct MCQ";
    case "multi_select":
      return "Multiple Correct MCQ";
    case "numerical_input":
      return "Numerical Answer";
    case "match_matrix":
      return "Matching List";
    default:
      return mode;
  }
}

export default function SectionInstructionCard(props: Props) {
  const {
    title,
    subjectLabel,
    answerMode,
    fullMarks,
    negativeMarks,
    partial_marks,
    maxSelections,
    scoringQuestionCount,
    description,
  } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {subjectLabel} — {title}
          </span>
          <Badge variant="secondary">{modeLabel(answerMode)}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <ul className="space-y-1">
          <li>
            <b>Marks:</b> +{fullMarks} correct,{" "}
            {negativeMarks < 0 ? `${negativeMarks} wrong` : "0 wrong"}
          </li>

          {maxSelections !== null && (
            <li>
              <b>Selection Rule:</b> Select up to {maxSelections} option(s)
            </li>
          )}

          {scoringQuestionCount !== null && (
            <li>
              <b>Best Questions Rule:</b> Best {scoringQuestionCount} questions
              count
            </li>
          )}

          {partial_marks && (
            <li>
              <b>Partial Marking:</b> Enabled
            </li>
          )}
        </ul>

        {description && (
          <details className="rounded-md border p-3">
            <summary className="cursor-pointer font-medium">
              Detailed Instructions
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs">
              {description}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
