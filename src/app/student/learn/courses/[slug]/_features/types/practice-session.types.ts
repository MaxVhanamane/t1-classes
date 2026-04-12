import { JSONContent } from "@tiptap/react";

export interface PracticeSessionOption {
    id: string;
    option_label: string;
    option_text: JSONContent;
    is_correct: boolean;
}


export interface PracticeSessionQuestion {
    id: string;
    question: JSONContent;
    explanation: JSONContent | null;
    options: PracticeSessionOption[];
}

export interface PracticeSetContent {
    id: string;
    title: string;
    description: string | null;
    questions: PracticeSessionQuestion[];
}
