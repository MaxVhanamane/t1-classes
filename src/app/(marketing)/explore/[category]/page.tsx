import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/src/app/admin/batches/_features/zod-schema/schema";
import { Link } from "@/src/components/ui/link";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

// export const dynamic = "force-static";

type Props = {
  params: Promise<{ category: Category }>;
};

/* -------------------------------------------------------------------------- */
/* Static Params                                                              */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }));
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function ExploreCategoryPage({ params }: Props) {
  "use cache";
  cacheLife("max");
  const { category } = await params;

  const label = CATEGORY_LABELS[category];

  if (!label) return notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-12 space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">{label}</h1>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Choose your learning style. Study at your own pace with courses or
          join guided batches with live classes and tests.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* COURSES */}
        <Link
          href={`/explore/${category}/courses/page/1`}
          className="relative rounded-2xl border p-6 active:scale-[0.98]"
        >
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Courses</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Self-paced learning
              </p>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Study anytime at your own speed with structured chapters, video
              lessons, notes, and practice questions.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2.5 py-1">
                Video Lectures
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Notes & PDFs
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Practice Sets
              </span>
            </div>

            <div className="pt-2 text-sm font-medium">Explore Courses →</div>
          </div>
        </Link>

        {/* BATCHES */}
        <Link
          href={`/explore/${category}/batches/page/1`}
          className="relative rounded-2xl border p-6 active:scale-[0.98]"
        >
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Batches</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Guided learning program
              </p>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Join a structured program with live classes, regular tests, and
              complete guidance to stay consistent and improve faster.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2.5 py-1">
                Video Lectures
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Notes & PDFs
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Practice Sets
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Includes Courses
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Live Classes
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Weekly Tests
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                Teacher Guidance
              </span>
            </div>

            <div className="pt-2 text-sm font-medium">Explore Batches →</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
