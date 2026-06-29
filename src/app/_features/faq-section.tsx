"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const FAQS = [
  {
    question: "Can I study on mobile?",
    answer:
      "Yes. T1 Classes is fully optimized for mobile devices so you can attend classes, practice tests, and study anywhere.",
  },
  {
    question: "Are live classes recorded?",
    answer:
      "Yes. All live sessions are recorded so students can revise concepts anytime at their own pace.",
  },
  {
    question: "Do courses include practice tests?",
    answer:
      "Yes. Courses include topic-wise practice sets and batches include full-length mock tests with detailed analytics.",
  },
  {
    question: "Is the test platform similar to real exams?",
    answer:
      "Yes. The test interface is designed to simulate competitive exams like JEE Advanced with advanced question types and exam-style navigation.",
  },
  {
    question: "Can I access study material after classes?",
    answer:
      "Yes. Students get access to notes, PDFs, recordings, and practice content directly inside the platform.",
  },
  {
    question: "Do you provide performance analytics?",
    answer:
      "Yes. Students can track accuracy, speed, weak topics, and overall progress through detailed analytics.",
  },
];

export function FAQSection() {
  return (
    <section>
      {/* heading */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Frequently Asked Questions
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Everything students usually ask before joining.
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Clear answers about classes, tests, recordings, access, and learning
          experience.
        </p>
      </div>

      {/* accordion */}
      <div className="mx-auto mt-14 max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/70 shadow-sm backdrop-blur-xl">
          <Accordion
            type="single"
            collapsible
            className="divide-y divide-border/60"
          >
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="border-none"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold hover:no-underline sm:px-8 sm:text-lg">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 text-sm leading-7 text-muted-foreground sm:px-8 sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
