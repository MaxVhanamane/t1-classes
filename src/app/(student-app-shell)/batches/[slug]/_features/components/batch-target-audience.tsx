import { CheckCircle2 } from "lucide-react";

export function BatchTargetAudienceSection({
  audience,
}: {
  audience: string[];
}) {
  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          Who This Program Is For
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Designed for serious aspirants seeking structured preparation.
        </p>
      </div>

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {audience.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <CheckCircle2 className="h-5 w-5 mt-1 text-primary/90 shrink-0" />
            <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
