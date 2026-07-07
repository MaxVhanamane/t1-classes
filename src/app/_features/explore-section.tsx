import { ExploreCategories } from "../student/dashboard/_features/components/explore-categories";

export function ExploreSection() {
  return (
    <section id="explore-section">
      {/* heading */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Exam Categories
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
          Explore by category
          {/* Added 'block mt-2' to force this onto a new line perfectly */}
          <span className="block mt-2 bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
            Find the right course or batch.
          </span>
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg text-balance">
          Select a category below to explore all available learning programs
          tailored to your goals.
        </p>
      </div>

      {/* main content component */}
      <div className="mt-14">
        <ExploreCategories isMarketing={true} />
      </div>
    </section>
  );
}
