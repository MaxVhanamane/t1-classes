export type CreatePracticeQuestionPayload = {
    courseId: string;
    topicId: string;
    practiceSetId: string;
    question: string;
    correct_answer_explanation: string | null;
    options: {
        option_text: string;
        is_correct: boolean;
    }[];
};
