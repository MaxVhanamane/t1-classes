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
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PracticeSetContent } from "../../types/practice-session.types";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { cn } from "@/src/lib/utils";
import { getGridStyles } from "../../helper-functions/practice-grid";
import DottedBackground from "@/src/components/dotted-background";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogOverlay,
} from "@/src/components/ui/alert-dialog";
type Step = "intro" | "question" | "summary" | "review";

type Props = {
  practiceSetId: string;
  onClose: () => void;
};

async function fetchPracticeSet(
  practiceSetId: string,
): Promise<PracticeSetContent> {
  return fetchWrapper<PracticeSetContent>(
    `/api/student/practice-sets/${practiceSetId}`,
  );
}

export function PracticeSetDialog({ practiceSetId, onClose }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["practice-set", practiceSetId],
    queryFn: () => fetchPracticeSet(practiceSetId),
  });

  const [step, setStep] = useState<Step>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(),
  );
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const questions = data?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  function visitQuestion(questionId: string) {
    setVisited((prev) => {
      if (prev.has(questionId)) return prev;

      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }
  // -----------------------------
  // NAVIGATION
  // -----------------------------

  function next() {
    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;

      visitQuestion(questions[nextIndex].id);

      setCurrentIndex(nextIndex);
    }
  }

  function prev() {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;

      visitQuestion(questions[prevIndex].id);

      setCurrentIndex(prevIndex);
    }
  }

  function jumpTo(index: number) {
    visitQuestion(questions[index].id);

    setCurrentIndex(index);
  }

  // -----------------------------
  // ANSWERS
  // -----------------------------

  function answerAndMark(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.add(questionId); // force add (not toggle)
      return next;
    });
  }

  function recordAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function toggleReview(questionId: string) {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  // -----------------------------
  // SUBMIT FLOW
  // -----------------------------

  function submit() {
    setShowConfirm(true);
  }

  function confirmSubmit() {
    setShowConfirm(false);
    setStep("summary");
  }

  function restart() {
    setAnswers({});
    setMarkedForReview(new Set());
    setCurrentIndex(0);
    setStep("question");
  }

  function startReview() {
    setCurrentIndex(0);
    setStep("review");
  }

  function startReviewAt(index: number) {
    setCurrentIndex(index);
    setStep("review");
  }

  // -----------------------------
  // COUNTS (IMPORTANT)
  // -----------------------------
  const counts = {
    answered: 0,
    not_answered: 0,
    review: 0,
    answered_review: 0,
  };

  questions.forEach((q) => {
    const isAnswered = !!answers[q.id];
    const isReview = markedForReview.has(q.id);

    if (isAnswered) {
      counts.answered++;

      if (isReview) {
        counts.answered_review++;
      }
    } else {
      counts.not_answered++;

      if (isReview) {
        counts.review++;
      }
    }
  });
  // -----------------------------
  // BACK BUTTON HANDLING
  // -----------------------------

  function handleClose() {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      onClose();
    }
  }

  useEffect(() => {
    window.history.pushState({ ...window.history.state, modal: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose]);

  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogOverlay className="backdrop-blur-xl" />

      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden",
          "h-dvh w-full max-w-none rounded-none",
          "sm:h-[90dvh] sm:w-[95vw] sm:max-w-xl sm:rounded-lg",
          "border-x-0 border-y-0 sm:border",
          showConfirm && "blur-lg opacity-30 pointer-events-none",
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Practice set</DialogTitle>
          <DialogDescription className="sr-only">
            Solve and review later
          </DialogDescription>

          <div className="text-base font-semibold truncate pr-8">
            Practice: {data?.title ?? "Loading…"}
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {isLoading && <LoadingPracticeSet />}

            {isError && <ErrorPracticeSet message={(error as Error).message} />}

            {step === "intro" && data && (
              <PracticeIntro
                title={data.title}
                description={data.description}
                onStart={() => {
                  if (questions[0]) {
                    visitQuestion(questions[0].id);
                  }

                  setStep("question");
                }}
              />
            )}

            {step === "question" && currentQuestion && (
              <PracticeQuestionView
                question={currentQuestion}
                index={currentIndex}
                total={questions.length}
                questions={questions}
                answers={answers}
                markedForReview={markedForReview}
                selectedOptionId={answers[currentQuestion.id]}
                onSelect={(optionId) =>
                  recordAnswer(currentQuestion.id, optionId)
                }
                onNext={next}
                onPrev={prev}
                visited={visited}
                onSubmit={submit}
                onJump={jumpTo}
                onToggleReview={toggleReview}
                onAnswerAndMark={answerAndMark}
              />
            )}

            {step === "summary" && (
              <PracticeSummary
                questions={questions}
                answers={answers}
                onRetry={restart}
                onClose={handleClose}
                onReview={startReview}
                onReviewAt={startReviewAt}
              />
            )}

            {step === "review" && currentQuestion && (
              <PracticeQuestionView
                question={currentQuestion}
                index={currentIndex}
                total={questions.length}
                questions={questions}
                answers={answers}
                markedForReview={markedForReview}
                selectedOptionId={answers[currentQuestion.id]}
                reviewMode
                onSelect={() => {}}
                onNext={next}
                onPrev={prev}
                visited={visited}
                onSubmit={submit}
                onJump={jumpTo}
                onToggleReview={toggleReview}
                onAnswerAndMark={answerAndMark}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
      {/* -----------------------------
              SUBMIT CONFIRM (PREVIEW SUMMARY)
          ----------------------------- */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogOverlay className="bg-black/40 backdrop-blur-lg" />
        <AlertDialogContent className="w-[calc(100%-1rem)] max-w-md ">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit practice?</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Answered" value={counts.answered} state="answered" />
            <Stat
              label="Not Answered"
              value={counts.not_answered}
              state="not_answered"
            />
            <Stat
              label="Marked for Review"
              value={counts.review}
              state="review"
            />
            <Stat
              label="Answered & Review"
              value={counts.answered_review}
              state="answered_review"
            />
          </div>
          <AlertDialogFooter className="flex-row gap-2 [&>button]:flex-1 sm:[&>button]:flex-none">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={confirmSubmit}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

// -----------------------------
// SMALL STAT COMPONENT
// -----------------------------

function Stat({
  label,
  value,
  state,
}: {
  label: string;
  value: number;
  state: "answered" | "not_answered" | "review" | "answered_review";
}) {
  return (
    <div
      className={cn(
        "rounded-md p-3 text-center relative ",
        getGridStyles(state),
      )}
    >
      <DottedBackground />
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-foreground">{label}</div>
    </div>
  );
}
