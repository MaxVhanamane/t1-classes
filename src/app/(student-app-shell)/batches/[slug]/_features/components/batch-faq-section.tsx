"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

export function BatchFAQSection() {
  return (
    <section>
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Frequently Asked Questions
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Everything You Need to Know Before Enrolling
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed">
            Clear answers to common questions about this batch program.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="lg:w-1/2 lg:inline-block lg:pr-6 align-top w-full mb-6"
            >
              <AccordionItem
                value={`item-${index}`}
                className="
    rounded-md
    border!
    border-border
    bg-background/60
    backdrop-blur
    px-6
    transition
    hover:border-primary/40
  "
              >
                <AccordionTrigger className="text-base font-medium text-left hover:no-underline">
                  {item.question}
                </AccordionTrigger>

                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "What is included in this batch?",
    answer:
      "This batch includes full access to all listed courses, structured test series, performance tracking, and continuous academic guidance throughout the program duration.",
  },
  {
    question: "Are tests included in the batch fee?",
    answer:
      "Yes. All chapter-wise tests, cumulative tests, and full-length exam-level tests are included. There are no additional charges for the test series.",
  },
  {
    question: "Do I need to purchase the courses separately?",
    answer:
      "No. All academic courses listed under this batch are included as part of the program. You do not need to enroll separately.",
  },
  {
    question: "How long will I have access?",
    answer:
      "Access remains valid for the entire duration of the batch as mentioned on this page.",
  },
  {
    question: "Is this suitable for beginners?",
    answer:
      "Yes. The batch is structured to build concepts from fundamentals while progressively moving toward advanced exam-level difficulty.",
  },
  {
    question: "Will live classes be conducted?",
    answer:
      "Live interactive sessions are planned and will be introduced as part of the program roadmap. Updates will be shared with enrolled students.",
  },
];
