"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { PracticeIntro } from "./practice-intro";
import { LoadingPracticeSet } from "./loading-practice-set";
import { ErrorPracticeSet } from "./error-practice-set";
import { AnimatePresence, motion } from "motion/react";
import { PracticeQuestionView } from "./practice-question-view";
import { PracticeSummary } from "./practice-summary";

type PracticeSetContent = {
  id: string;
  title: string;
  description: string | null;
  questions: {
    id: string;
    question: string;
    explanation: string | null;
    options: {
      id: string;
      optionText: string;
      isCorrect: boolean;
    }[];
  }[];
};

type Props = {
  practiceSetId: string;
  onClose: () => void;
};

export function PracticeSetDialog({ practiceSetId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PracticeSetContent | null>(null);

  const [step, setStep] = useState<"intro" | "question" | "summary">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/practice-sets/${practiceSetId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load practice set");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [practiceSetId]);

  const questions = data?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  function recordAnswer(questionId: string, correct: boolean) {
    setAnswers((p) => ({ ...p, [questionId]: correct }));
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
      <DialogOverlay className=" backdrop-blur-xs" />
      <DialogContent className="flex h-[90vh] w-[95vw] sm:max-w-xl flex-col p-0 gap-0">
        <DialogHeader className="border-b px-4 py-3 ">
          <DialogTitle className="sr-only">Practice set</DialogTitle>
          <div className="text-base font-semibold truncate pr-8">
            Practice: {data?.title ?? "Loading…"}
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto ">
          <AnimatePresence mode="wait">
            {loading && <LoadingPracticeSet />}

            {error && <ErrorPracticeSet message={error} />}

            {!loading && data && step === "intro" && (
              <motion.div
                className=" h-full"
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PracticeIntro
                  title={data.title}
                  description={data.description}
                  onStart={() => setStep("question")}
                />
              </motion.div>
            )}

            {!loading && data && step === "question" && currentQuestion && (
              <PracticeQuestionView
                key={currentQuestion.id}
                question={currentQuestion}
                index={currentIndex}
                total={questions.length}
                answered={answers[currentQuestion.id] !== undefined}
                onAnswered={(c) => recordAnswer(currentQuestion.id, c)}
                onNext={next}
              />
            )}

            {!loading && data && step === "summary" && (
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
