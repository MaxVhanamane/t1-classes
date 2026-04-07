// import { Badge } from "@/src/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function BatchLiveClassesSection() {
  return (
    <section>
      <div className="mx-auto  space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Live Academic Sessions
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Interactive Live Classes
            </h2>
            {/* <Badge variant="secondary" className="text-xs">
              Launching Soon
            </Badge> */}
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">
            Live sessions designed for real-time doubt solving, concept
            revision, and performance discussions with faculty.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          <LiveFeature text="Scheduled weekly live revision sessions" />
          <LiveFeature text="Real-time doubt clarification" />
          <LiveFeature text="Strategy & performance review sessions" />
          <LiveFeature text="Recorded access for later revision" />
          <LiveFeature text="Exam strategy guidance from faculty" />
          <LiveFeature text="Topic-focused problem-solving workshops" />
        </div>
      </div>
    </section>
  );
}

function LiveFeature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 mt-1 shrink-0 text-primary/90" />
      <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
        {text}
      </p>
    </div>
  );
}
