
import { CheckCircle2 } from "lucide-react";

export function BatchTestsSection() {
  return (
    <section>
      <div className="mx-auto  space-y-20">
        {/* Header */}
        <div className="max-w-3xl space-y-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Assessment System
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Structured Testing & Continuous Improvement
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed">
            Regular testing designed to track progress, strengthen weak areas,
            and prepare you for real exam pressure.
          </p>
        </div>

        {/* Overall Assessment Highlights */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Highlight text="Weekly tests to track progress" />
          <Highlight text="Chapter-wise tests after completion of each unit" />
          <Highlight text="Detailed performance analysis after every test" />
          <Highlight text="Error review & improvement tracking" />
          <Highlight text="Exam-level marking & difficulty pattern" />
          <Highlight text="Reinforcement through regular practice cycles" />
        </div>

        {/* Test Blocks */}
        <div className="space-y-24">
          <TestBlock
            title="Objective Practice Tests"
            description="Build speed and accuracy through structured single-correct-answer practice."
            features={[
              "Weekly cumulative tests covering multiple subjects",
              "Same marking scheme as actual exams",
              "Chapter-wise & full syllabus tests",
              "Video solutions for every paper",
            ]}
            reverse
          />

          <TestBlock
            title="Advanced Multi-Format Tests (JEE Advanced Style)"
            description="Practice high-difficulty question types used in top competitive exams."
            features={[
              "Numerical answer type questions",
              "Multiple correct answer questions",
              "Match the pairs format",
              "Mixed-format full-length tests",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 mt-1 shrink-0 text-primary/90" />
      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function TestBlock({
  title,
  description,
  features,
  reverse = false,
}: {
  title: string;
  description: string;
  features: string[];
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid gap-14 items-center lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Content FIRST (mobile correct order) */}
      <div className="space-y-8 max-w-xl order-1 lg:order-0">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          {title}
        </h3>

        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-1 shrink-0 text-primary/90" />
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Video SECOND on mobile */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-xl bg-background border order-2 lg:order-0">
        <div className="aspect-video w-full">
          <iframe
            src="https://www.youtube.com/embed/UgseormfMc4"
            title={title}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
