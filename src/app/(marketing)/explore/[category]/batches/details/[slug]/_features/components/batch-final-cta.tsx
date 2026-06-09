"use client";
import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";
import { EnrollmentCTADialog } from "../../../../../courses/details/[slug]/components/enrollment-cta-dialog";
import { ExploreBatchDetail } from "../types/batch.types";

export function BatchFinalCTA({ batch }: { batch: ExploreBatchDetail }) {
  const [openEnrollmentDialog, setOpenEnrollmentDialog] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const startDate = new Date(batch.start_date);
    const now = new Date();
    const rawDiff = differenceInDays(startDate, now);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysLeft(rawDiff > 0 ? rawDiff : 0);
  }, [batch.start_date]);
  const hasDiscount = batch.list_price > batch.sale_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((batch.list_price - batch.sale_price) / batch.list_price) * 100,
      )
    : 0;

  return (
    <section>
      <EnrollmentCTADialog
        open={openEnrollmentDialog}
        onOpenChange={setOpenEnrollmentDialog}
        batchId={batch.id}
        courseId={null}
        title={batch.title}
        price={batch.sale_price}
      />

      <div className="relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                Secure your seat today
              </h3>
              <p className="text-muted-foreground">
                Join this batch and start structured preparation with expert
                guidance.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Program Fee
              </p>
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold">
                  ₹{formatPriceWithComma(batch.sale_price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{formatPriceWithComma(batch.list_price)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <Badge className="mt-2 bg-emerald-600 text-white">
                  Save {discountPercent}% on enrollment
                </Badge>
              )}
            </div>

            {/* Only render urgency indicators after hydration to avoid date freeze */}
            {daysLeft !== null && (daysLeft > 0 || batch.capacity) && (
              <div className="flex flex-wrap gap-6 text-sm pt-4 text-muted-foreground">
                {daysLeft > 0 && (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Clock className="h-4 w-4" />
                    Batch starts in {daysLeft} days
                  </div>
                )}
                {batch.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Limited to {batch.capacity} students
                  </div>
                )}
              </div>
            )}

            <div className="pt-8">
              <Button
                onClick={() => setOpenEnrollmentDialog(true)}
                disabled={!batch.is_admission_open}
                className="w-full lg:w-auto px-8 lg:px-12 py-6 lg:py-6 text-base lg:text-base font-semibold shadow-lg rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {batch.is_admission_open ? "Enroll Now" : "Admissions Closed"}
              </Button>
              {batch.is_admission_open && (
                <div className="flex flex-wrap gap-4 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Instant confirmation
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Limited seats available
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:grid gap-4 sm:grid-cols-2 text-sm">
            <TrustPoint text="Structured full syllabus coverage" />
            <TrustPoint text="Integrated test series" />
            <TrustPoint text="Live academic guidance" />
            <TrustPoint text="Dedicated doubt solving support" />
          </div>

          <div className="lg:hidden">
            <p className="text-xs text-muted-foreground text-center">
              ✔ Structured syllabus • Integrated tests • Live guidance • Doubt
              support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
