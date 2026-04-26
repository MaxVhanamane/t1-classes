"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { PracticeIntro } from "./practice-intro";
import { LoadingPracticeSet } from "./loading-practice-set";
import { ErrorPracticeSet } from "./error-practice-set";
import { PracticeQuestionView } from "./practice-question-view";
import { PracticeSummary } from "./practice-summary";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PracticeSetContent } from "../../types/practice-session.types";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

type Props = {
  practiceSetId: string;
  onClose: () => void;
};

async function fetchPracticeSet(
  practiceSetId: string,
): Promise<PracticeSetContent> {
  return fetchWrapper<PracticeSetContent>(
    `/api/practice-sets/${practiceSetId}`,
  );
}

export function PracticeSetDialog({ practiceSetId, onClose }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["practice-set", practiceSetId],
    queryFn: () => fetchPracticeSet(practiceSetId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const [step, setStep] = useState<"intro" | "question" | "summary">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions = data?.questions ?? [];
  const hasNoQuestions = !isLoading && data && questions.length === 0;
  const currentQuestion = questions[currentIndex];

  function recordAnswer(questionId: string, correct: boolean) {
    setAnswers((prev) => ({ ...prev, [questionId]: correct }));
  }

  function next() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep("summary");
    }
  }

  function restart() {
    setAnswers({});
    setCurrentIndex(0);
    setStep("question");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="flex h-[90dvh] w-[95vw] sm:max-w-xl flex-col p-0 gap-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Practice set</DialogTitle>
          <DialogDescription className="sr-only">
            Solve the practice questions and review your performance at the end.
          </DialogDescription>
          <div className="text-base font-semibold truncate pr-8">
            Practice: {data?.title ?? "Loading…"}
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isLoading && <LoadingPracticeSet />}

            {isError && <ErrorPracticeSet message={(error as Error).message} />}

            {hasNoQuestions && (
              <motion.div
                key="empty"
                className="flex h-full flex-col items-center justify-center px-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-medium">
                  No questions available yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This practice set doesn’t have any questions yet. Please check
                  back later.
                </p>
              </motion.div>
            )}

            {!isLoading && data && !hasNoQuestions && step === "intro" && (
              <motion.div
                key="intro"
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PracticeIntro
                  title={data.title}
                  description={data.description}
                  onStart={() => {
                    if (questions.length === 0) return;
                    setStep("question");
                  }}
                />
              </motion.div>
            )}
            {!isLoading &&
              data &&
              !hasNoQuestions &&
              step === "question" &&
              currentQuestion && (
                <PracticeQuestionView
                  key={currentQuestion.id}
                  question={currentQuestion}
                  index={currentIndex}
                  total={questions.length}
                  answered={answers[currentQuestion.id] !== undefined}
                  onAnswered={(correct) =>
                    recordAnswer(currentQuestion.id, correct)
                  }
                  onNext={next}
                />
              )}
            {!isLoading && data && !hasNoQuestions && step === "summary" && (
              <PracticeSummary
                total={questions.length}
                answers={answers}
                onRetry={restart}
                onClose={onClose}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
