import { Card, CardContent } from "@/src/components/ui/card";
import { getGridClasses } from "../../../../attempt/[attemptId]/_features/helpers/grid-colors";

function LegendBox({
  state,
}: {
  state:
    | "not_visited"
    | "not_answered"
    | "answered"
    | "review"
    | "answered_review";
}) {
  return (
    <div
      className={`h-5.5 w-5.5 rounded-sm border shrink-0 ${getGridClasses(state)}`}
    />
  );
}

function ActionBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`
        shrink-0
        rounded-sm
        border
        px-2.5
        py-1
        text-xs
        font-medium
        whitespace-nowrap
        w-fit
        ${className}
      `}
    >
      {children}
    </span>
  );
}

const ACTION_STYLES = {
  saveNext: getGridClasses("answered"),

  saveReview: getGridClasses("answered_review"),

  reviewNext: getGridClasses("review"),

  clear: getGridClasses("not_answered"),

  navigation: getGridClasses("not_visited"),

  submit: `
    border-red-600
    bg-red-500/90
    text-white
    dark:bg-red-500/20
    dark:text-red-300
    dark:border-red-500/40
  `,
};

export default function GeneralInstructions() {
  return (
    <Card className="bg-background">
      <CardContent className="space-y-6">
        {/* General Rules */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Before You Start</h3>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Once the test starts, the timer continues running even if you
              close the browser, refresh the page, lose internet connectivity,
              or exit the app.
            </li>

            <li>
              • You can resume an active attempt from your dashboard while time
              remains.
            </li>

            <li>
              • Do not switch tabs, close the test window, or leave the test
              screen unnecessarily during the examination.
            </li>

            <li>
              • Answers should be saved using the provided actions before moving
              away from a question.
            </li>

            <li>
              • You may freely navigate between questions and sections during
              the test.
            </li>

            <li>
              • Use the final Submit Test button when you have completed the
              examination.
            </li>
          </ul>
        </div>

        {/* Question Status */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Question Status Legend</h3>

          <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <LegendBox state="not_visited" />
              <span>Not Visited</span>
            </div>

            <div className="flex items-center gap-3">
              <LegendBox state="not_answered" />
              <span>Visited but Not Answered</span>
            </div>

            <div className="flex items-center gap-3">
              <LegendBox state="answered" />
              <span>Answered</span>
            </div>

            <div className="flex items-center gap-3">
              <LegendBox state="review" />
              <span>Marked for Review</span>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <LegendBox state="answered_review" />
              <span>
                Answered & Marked for Review (Will still be considered for
                evaluation)
              </span>
            </div>
          </div>
        </div>

        {/* Question Actions */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Question Actions</h3>

          <div className="space-y-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.saveNext}>
                Save & Next
              </ActionBadge>
              <p className="text-muted-foreground">
                Saves the current answer and moves to the next question.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.clear}>Clear</ActionBadge>
              <p className="text-muted-foreground">
                Removes the selected answer from the current question.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.saveReview}>
                Save & Mark for Review
              </ActionBadge>
              <p className="text-muted-foreground">
                Saves your answer and marks the question for later review.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.reviewNext}>
                Mark for Review & Next
              </ActionBadge>
              <p className="text-muted-foreground">
                Marks the question for review without saving an answer and moves
                to the next question.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.navigation}>
                Back / Next
              </ActionBadge>
              <p className="text-muted-foreground">
                Navigate freely between questions and sections during the test.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <ActionBadge className={ACTION_STYLES.submit}>
                Submit Test
              </ActionBadge>
              <p className="text-muted-foreground">
                Final submission. Answers cannot be modified afterwards.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
