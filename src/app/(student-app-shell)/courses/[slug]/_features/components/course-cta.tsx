"use client";
import { Button } from "@/src/components/ui/button";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";
import { CheckCircle2 } from "lucide-react";
import { EnrollmentCTADialog } from "./enrollment-cta-dialog";
import { useState } from "react";

type Props = {
  list_price: number;
  sale_price: number;
  courseId: string;
  courseTitle: string;
};

export function CourseCTA({
  list_price,
  sale_price,
  courseId,
  courseTitle,
}: Props) {
  const [openEnrollmentDialog, setOpenEnrollmentDialog] = useState(false);
  const discount =
    list_price && list_price > sale_price
      ? Math.round(((list_price - sale_price) / list_price) * 100)
      : null;

  return (
    <div className="space-y-4 rounded-xl border bg-background px-5 py-5">
      {/* Price + CTA Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Course Price</p>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">
                {sale_price === 0
                  ? "Free"
                  : `₹${formatPriceWithComma(sale_price)}`}
              </span>

              {list_price && list_price !== sale_price && sale_price !== 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{formatPriceWithComma(list_price)}
                </span>
              )}
            </div>
            {discount && sale_price !== 0 && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300 ml-2">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        <EnrollmentCTADialog
          title={courseTitle}
          courseId={courseId}
          open={openEnrollmentDialog}
          onOpenChange={() => setOpenEnrollmentDialog(false)}
          price={sale_price}
        />
        <Button onClick={() => setOpenEnrollmentDialog(true)}>
          Enroll Now
        </Button>
      </div>

      {/* Trust Points */}
      <div className="grid gap-x-6 gap-y-2 pt-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Structured chapter-wise learning path</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Video lessons with supporting resources</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Practice sets for concept reinforcement</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Designed for progressive topic mastery</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Concept-focused explanations</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/90 shrink-0" />
          <span>Exam-oriented problem solving approach</span>
        </div>
      </div>
    </div>
  );
}
