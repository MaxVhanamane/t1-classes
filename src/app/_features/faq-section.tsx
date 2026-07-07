"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const FAQS = [
  {
    question: "Can I study on my mobile phone?",
    answer:
      "Yes. The platform is fully optimized for mobile. You can watch video lectures, join live sessions, and even take advanced tests with complex question formats right from your phone.",
  },
  {
    question: "How do the live classes work?",
    answer:
      "Instead of generic daily lectures, teachers schedule live classes specifically for deep-dives into complex topics and instant doubt resolution. Every live session is also recorded and saved to your dashboard.",
  },
  {
    question: "Are the tests actually like the real exam?",
    answer:
      "Exactly like it. Our test engine supports advanced formats including single-choice, multi-correct, numerical input, and match matrix, complete with authentic partial and negative marking rules.",
  },
  {
    question: "What kind of test analytics do I get?",
    answer:
      "You get highly detailed data after every test. Beyond just your score, you can track partial marks, negative marking, and the exact seconds you spent on each question compared to the class average.",
  },
  {
    question: "Do courses include practice material?",
    answer:
      "Absolutely. Our courses follow a strict Video → Practice loop. You will get topic-wise practice sets immediately after lessons, plus full-length mock tests if you join a complete batch.",
  },
  {
    question: "What if I get stuck and need mentorship?",
    answer:
      "You can ask doubts instantly in the chat during any scheduled live class. We also host group mentorship sessions to discuss exam strategy, fix common mistakes, and help you handle exam pressure.",
  },
];

export function FAQSection() {
  return (
    <section>
      {/* ── Header ── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Frequently Asked Questions
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
          Everything you need to know.
          <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
            Clear your doubts before joining.
          </span>
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
          Find answers about our testing platform, live classes, analytics, and
          overall learning experience.
        </p>
      </div>

      {/* ── Accordion ── */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/50 shadow-sm backdrop-blur-xl">
          {/* Subtle top glow for the container */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />

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
                <AccordionTrigger className="px-6 py-6 text-left text-base font-semibold transition-colors hover:text-primary hover:no-underline sm:px-8 sm:text-lg">
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
