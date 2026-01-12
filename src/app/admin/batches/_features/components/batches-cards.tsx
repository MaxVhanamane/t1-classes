import { Button } from "@/src/components/ui/button";
import { ModeBadge, StatusBadge } from "./batch-badges";
import { BatchDuration } from "./batch-duration";
import { ChevronDown, Pencil } from "lucide-react";
import { BatchListItem } from "../types/types";
import { BatchActiveSwitch } from "./batch-active-switch";
import { Badge } from "@/src/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { getHighlightPreview } from "./batches-table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
type Props = {
  batches: BatchListItem[];
  onEdit: (batch: BatchListItem) => void;
};

export function BatchesCards({ batches, onEdit }: Props) {
  return (
    <div className="md:hidden space-y-4">
      {batches.map((batch) => (
        <div key={batch.id} className="border rounded-lg p-4 space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-base">{batch.name}</h3>

              {/* COURSES */}
              {batch.courses.length === 0 ? (
                <p className="text-sm text-destructive font-medium">
                  No courses linked
                </p>
              ) : batch.courses.length === 1 ? (
                <p className="text-sm text-muted-foreground">
                  Course: {batch.courses[0].course.title}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Courses:{" "}
                  {batch.courses.map(({ course }) => course.title).join(", ")}
                </p>
              )}
            </div>

            <Button size="icon" variant="ghost" onClick={() => onEdit(batch)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* DESCRIPTION */}
          {batch.description && <MobileDescription text={batch.description} />}

          {batch.batch_highlights &&
            getHighlightPreview(batch.batch_highlights).length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-primary font-medium flex items-center gap-1"
                  >
                    View highlights
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-3">
                  {getHighlightPreview(batch.batch_highlights).map(
                    (section) => (
                      <div key={section.title}>
                        <p className="text-sm font-semibold text-muted-foreground">
                          {section.title}
                        </p>

                        <ul className="list-disc pl-4 text-sm space-y-0.5">
                          {section.shown.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>

                        {section.hiddenCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            +{section.hiddenCount} more
                          </p>
                        )}
                      </div>
                    )
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

          {/* PRICE + ADMISSION */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">₹ {batch.price}</Badge>

            <Badge variant="outline">
              {batch.admission_open ? "Admission Open" : "Admission Closed"}
            </Badge>
          </div>

          {/* MODE + STATUS */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mode:</span>
              <ModeBadge mode={batch.mode} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={batch.status} />
            </div>
          </div>

          {/* DURATION */}
          <div className="text-sm">
            <span className="text-muted-foreground">Duration:</span>{" "}
            <BatchDuration {...batch} />
          </div>

          {/* CENTER */}
          <div className="text-sm">
            <span className="text-muted-foreground">Center:</span>{" "}
            {batch.center_name ?? "—"}
          </div>

          {/* LANGUAGES */}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Languages:</span>

            <div className="flex flex-wrap gap-1">
              {batch.languages.length > 0 ? (
                batch.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="capitalize">
                    {lang}
                  </Badge>
                ))
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <span>Capacity: {batch.capacity ?? "Unlimited"}</span>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Active</span>
              <BatchActiveSwitch
                batchId={batch.id}
                initialValue={batch.is_active}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // Only check truncation when collapsed
    if (!expanded) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [text, expanded]);

  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p ref={ref} className={expanded ? "" : "line-clamp-2"}>
        {text.trim()}
      </p>

      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
