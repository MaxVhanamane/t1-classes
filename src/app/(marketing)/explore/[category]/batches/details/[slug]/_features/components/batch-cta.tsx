"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";
import { CheckCircle2 } from "lucide-react";
import { EnrollmentCTADialog } from "../../../../../courses/details/[slug]/components/enrollment-cta-dialog";
import { ExploreBatchDetail } from "../types/batch.types";

export function BatchCTA({ batch }: { batch: ExploreBatchDetail }) {
  const [openEnrollmentDialog, setOpenEnrollmentDialog] = useState(false);

  const hasDiscount = batch.list_price > batch.sale_price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((batch.list_price - batch.sale_price) / batch.list_price) * 100,
      )
    : 0;

  return (
    <div className="space-y-5 rounded-xl border bg-background px-5 py-5">
      {/* Dialog */}
      <EnrollmentCTADialog
        open={openEnrollmentDialog}
        onOpenChange={setOpenEnrollmentDialog}
        batchId={batch.id}
        courseId={null}
        title={batch.title}
        price={batch.sale_price}
      />

      {/* Price Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Program Fee</p>

          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-semibold">
              ₹{formatPriceWithComma(batch.sale_price)}
            </p>

            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{formatPriceWithComma(batch.list_price)}
              </p>
            )}
          </div>

          {hasDiscount && (
            <p className="text-xs text-primary/80">
              Save {discountPercent}% on enrollment
            </p>
          )}
        </div>

        <Button
          onClick={() => setOpenEnrollmentDialog(true)}
          disabled={!batch.is_admission_open}
        >
          {batch.is_admission_open ? "Enroll Now" : "Admissions Closed"}
        </Button>
      </div>

      {/* Trust Points */}
      <div className="grid gap-x-6 gap-y-2 pt-2 sm:grid-cols-2">
        <TrustPoint text="Structured full syllabus coverage" />
        <TrustPoint text="Integrated test series" />
        <TrustPoint text="Live academic guidance" />
        <TrustPoint text="Doubt solving support" />
      </div>
    </div>
  );
}

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/90" />
      <span>{text}</span>
    </div>
  );
}
