import Link from "next/link";
import { Button } from "@/src/components/ui/button";

type Props = {
  price: number;
  hasAccess: boolean;
  slug: string;
};

export function CourseCTA({ price, hasAccess, slug }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border p-6 bg-card">
      {/* Price */}
      <div>
        <p className="text-sm text-muted-foreground">Course Price</p>
        <p className="text-2xl font-semibold">₹{price}</p>
      </div>

      {/* CTA */}
      {hasAccess ? (
        <Button asChild size="lg">
          <Link href={`/learn/courses/${slug}`}>Continue Learning</Link>
        </Button>
      ) : (
        <Button size="lg">Enroll Now</Button>
      )}
    </div>
  );
}
