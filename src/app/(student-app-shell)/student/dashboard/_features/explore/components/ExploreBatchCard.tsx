import Image from "next/image";
import { Link } from "@/src/components/ui/link";

import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { ExploreBatch } from "@/src/app/api/explore-batches/types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { formatDateShort } from "@/src/lib/date";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { BatchQuickInfoPopover } from "./batch-quick-info-popover";

export function ExploreBatchCard({ batch }: { batch: ExploreBatch }) {
  const discount =
    batch.list_price && batch.list_price > batch.sale_price
      ? Math.round(
          ((batch.list_price - batch.sale_price) / batch.list_price) * 100,
        )
      : null;
  const startDate = new Date(batch.start_date);
  const now = new Date();
  const hasStarted = startDate <= now;
  return (
    <Card className="group flex h-115 flex-col overflow-hidden rounded-2xl border bg-background p-0 transition-all hover:shadow-lg gap-3">
      {/* ================= IMAGE (TOP 50% — CLEAN FADE) ================= */}
      <div className="relative aspect-video w-full overflow-hidden shrink-0">
        {batch.thumbnail_image ? (
          <Image
            src={`${R2_BUCKET_PUBLIC_URL}/${batch.thumbnail_image}`}
            alt={batch.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-[1.02] contrast-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
            No Image
          </div>
        )}

        {/* Small bottom fade (NO BLUR) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/35 to-transparent" />

        <div className="absolute bottom-2 right-2 flex flex-wrap items-center gap-2 rounded-xl bg-black/80 px-3 py-1.5 text-white ring-1 ring-white/10 shadow-xl">
          <BatchMetaBadges batch={{ ...batch, is_active: true }} />
        </div>
      </div>

      {/* ================= CONTENT (AUTO HEIGHT) ================= */}
      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-0 relative overflow-hidden">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {batch.title}
        </h3>

        {/* Subtitle */}
        {batch.subtitle && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {batch.subtitle}
          </p>
        )}

        {/* Meta Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {hasStarted ? "Started" : "Starts"}{" "}
            {formatDateShort(batch.start_date)}
          </span>

          <BatchQuickInfoPopover
            classLevel={batch.class_level}
            targetExam={batch.target_exam}
            subjects={batch.subjects ?? []}
            courseCount={batch.course_count}
          />
        </div>

        {/* Push pricing + footer down */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold">
              {batch.sale_price === 0
                ? "Free"
                : `₹${formatPriceWithComma(batch.sale_price)}`}
            </span>

            {batch.list_price && batch.sale_price !== 0 ? (
              <span className="text-sm text-muted-foreground line-through">
                ₹{formatPriceWithComma(batch.list_price)}
              </span>
            ) : null}
          </div>
          {discount && batch.sale_price !== 0 && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {discount}% OFF
            </span>
          )}
        </div>
      </CardContent>

      {/* ================= FOOTER ================= */}
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full font-medium"
          disabled={!batch.is_admission_open}
        >
          <Link href={`/batches/${batch.slug}`}>
            {batch.is_admission_open ? "View Batch" : "Admissions Closed"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
