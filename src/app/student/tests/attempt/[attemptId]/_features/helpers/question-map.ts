import { AnswerMode, Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

import { StateItem } from "../types/workspace.types";
import { GridState } from "../types/grid.types";

export type MappedQuestion = {
  id: string;
  index: number;
  state: GridState;
};

export type MappedSection = Omit<Section, "questions"> & {
  questions: MappedQuestion[];
};

export function buildQuestionMap(
  sections: Section[],
  state: StateItem[],
): MappedSection[] {
  let counter = 1;

  return sections.map((section) => ({
    ...section,
    sectionId: section.id,
    title: section.title,
    subjectLabel: section.subjectLabel,


    questions: section.questions.map((q) => {
      const item = state.find(
        (s) => s.questionId === q.id,
      );

      let gridState: GridState =
        "not_visited";

      if (item) {
        if (
          item.markedForReview &&
          item.answer
        ) {
          gridState = "answered_review";
        } else if (item.markedForReview) {
          gridState = "review";
        } else if (item.answer) {
          gridState = "answered";
        } else if (item.visited) {
          gridState = "not_answered";
        }
      }

      return {
        id: q.id,
        index: counter++,
        state: gridState,
      };
    }),
  }));
}



export function getQuestionCounts(
  sections: MappedSection[],
) {
  const counts = {
    not_visited: 0,
    answered: 0,
    not_answered: 0,
    review: 0,
    answered_review: 0,
  };

  sections.forEach((section) => {
    section.questions.forEach((q) => {
      counts[q.state]++;
    });
  });

  return counts;
}


export const ANSWER_MODE_LABELS: Record<AnswerMode, string> = {
  single_select: "Single",
  multi_select: "Multi",
  numerical_input: "Numeric",
  match_matrix: "Match",
};

export function getAnswerModeLabel(mode: AnswerMode) {
  return ANSWER_MODE_LABELS[mode];
}
