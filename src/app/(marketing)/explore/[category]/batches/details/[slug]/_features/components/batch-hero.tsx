"use client";

import Image from "next/image";
import { ExploreBatchDetail } from "@/src/app/api/explore-batches/[slug]/types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { CheckCircle2 } from "lucide-react";
import { BatchCTA } from "./batch-cta";
import { BatchMetaInline } from "./batch-meta-inline";

export function BatchHero({ batch }: { batch: ExploreBatchDetail }) {
  return (
    <section className="grid gap-12 lg:grid-cols-2 items-start">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
          {batch.is_admission_open && (
            <div className="absolute top-4 left-4 z-10 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground shadow">
              Admissions Open
            </div>
          )}

          {batch.thumbnail_image && (
            <Image
              src={`${R2_BUCKET_PUBLIC_URL}/${batch.thumbnail_image}`}
              alt={batch.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* CTA stays visually connected to image */}
        <BatchCTA batch={batch} />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {batch.title}
          </h1>

          {batch.subtitle && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {batch.subtitle}
            </p>
          )}

          <BatchMetaInline batch={batch} />
        </div>

        {/* Learning Outcomes */}
        {batch.learning_outcomes && batch.learning_outcomes.length > 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">What You’ll Achieve</h2>
              <p className="text-sm text-muted-foreground">
                By the end of this program:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {batch.learning_outcomes.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary/90" />
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
