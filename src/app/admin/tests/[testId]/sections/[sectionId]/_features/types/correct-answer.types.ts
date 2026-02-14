export type SingleSelectAnswer = {
    option_id: string
}

export type MultiSelectAnswer = {
    option_ids: string[]
}

export type MatchMatrixAnswer = {
    matrix: Record<string, string>
}

export type NumericalAnswer = {
    target: number;
    tolerance: number;
};

export type CorrectAnswer =
    | SingleSelectAnswer
    | MultiSelectAnswer
    | MatchMatrixAnswer
    | NumericalAnswer
