import {
  BookOpen,
  Activity,
  Sigma,
  Target,
  Brain,
  GraduationCap,
  Award,
  Wrench,
  Landmark,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/src/app/admin/batches/_features/zod-schema/schema";
import { cn } from "@/src/lib/utils";
import DottedBackground from "@/src/components/dotted-background";
import { Link } from "@/src/components/ui/link";
import { cacheLife } from "next/cache";

const LIGHT_GRADIENTS = {
  cyan: "from-cyan-500/15 to-cyan-500/5",
  emerald: "from-emerald-500/15 to-emerald-500/5",
  yellow: "from-yellow-500/15 to-yellow-500/5",
  pink: "from-pink-500/15 to-pink-500/5",
  purple: "from-purple-500/15 to-purple-500/5",
  indigo: "from-indigo-500/15 to-indigo-500/5",
  teal: "from-teal-500/15 to-teal-500/5",
  gray: "from-gray-500/10 to-gray-500/5",
};

const CATEGORY_CONFIG = {
  boards: {
    icon: BookOpen,
    color: "cyan",
    tags: ["Class 8–12"],
    active: true,
  },
  neet: {
    icon: Activity,
    color: "emerald",
    tags: ["Class 11", "Class 12"],
    active: true,
  },
  jee: {
    icon: Sigma,
    color: "yellow",
    tags: ["Class 11", "Class 12"],
    active: true,
  },
  cet: {
    icon: Target,
    color: "pink",
    tags: ["Class 11", "Class 12"],
    active: true,
  },
  nmms: {
    icon: Brain,
    color: "purple",
    tags: ["Class 8"],
    active: true,
  },
  foundation: {
    icon: GraduationCap,
    color: "indigo",
    tags: ["Class 8–10"],
    active: true,
  },
  scholarship: {
    icon: Award,
    color: "teal",
    tags: ["Class 7", "Class 8"],
    active: true,
  },
  /* Disabled */
  gate: {
    icon: Wrench,
    color: "gray",
    tags: ["Engineering"],
    active: false,
  },
  govt_exam: {
    icon: Landmark,
    color: "gray",
    tags: ["Coming Soon"],
    active: false,
  },
} as const;

export async function ExploreCategories() {
  "use cache";
  cacheLife("max");
  return (
    <div className="space-y-5 mb-20">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Explore Categories</h2>
        <p className="text-sm text-muted-foreground">
          Choose your goal and start learning
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
          if (!config) return null;

          const Icon = config.icon;
          const isDisabled = !config.active;
          const color = config.color;

          const className = `group relative overflow-hidden rounded-2xl border  dark:border-white/10 bg-card p-4 text-left
            ${
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "active:scale-[0.98]"
            }`;

          const content = (
            <>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 dark:ring-white/10" />
              <DottedBackground />

              {/* DARK MODE TOP GLOW */}
              <div
                className={` pointer-events-none absolute inset-x-0 top-0 h-24 blur-2xl hidden dark:block ${
                  color === "cyan"
                    ? "bg-linear-to-b from-cyan-300/50 via-cyan-300/5 to-transparent"
                    : ""
                } ${
                  color === "emerald"
                    ? "bg-linear-to-b from-emerald-400/40 via-emerald-300/5 to-transparent"
                    : ""
                } ${
                  color === "yellow"
                    ? "bg-linear-to-b from-yellow-400/40 via-yellow-300/5 to-transparent"
                    : ""
                } ${
                  color === "pink"
                    ? "bg-linear-to-b from-pink-400/40 via-pink-300/5 to-transparent"
                    : ""
                } ${
                  color === "purple"
                    ? "bg-linear-to-b from-purple-400/40 via-purple-300/5 to-transparent"
                    : ""
                } ${
                  color === "indigo"
                    ? "bg-linear-to-b from-indigo-400/40 via-indigo-300/5 to-transparent"
                    : ""
                } ${
                  color === "teal"
                    ? "bg-linear-to-b from-teal-400/40 via-teal-300/5 to-transparent"
                    : ""
                } ${
                  color === "gray"
                    ? "bg-linear-to-b from-gray-400/20 via-gray-300/5 to-transparent"
                    : ""
                } `}
              />

              {/* BORDER GLOW */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-2xl dark:ring-1 dark:ring-inset",
                  color === "cyan" && "dark:ring-cyan-300/15",
                  color === "emerald" && "dark:ring-emerald-300/15",
                  color === "yellow" && "dark:ring-yellow-300/15",
                  color === "pink" && "dark:ring-pink-300/15",
                  color === "purple" && "dark:ring-purple-300/15",
                  color === "indigo" && "dark:ring-indigo-300/15",
                  color === "teal" && "dark:ring-teal-300/15",
                  color === "gray" && "dark:ring-gray-300/10",
                )}
              />

              {/* LIGHT MODE GRADIENT */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${LIGHT_GRADIENTS[color]} to-${LIGHT_GRADIENTS[color]} dark:hidden`}
              />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    Explore category
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {config.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-background/80 dark:bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {isDisabled && (
                  <span className="absolute top-2 right-2 z-20 text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-black dark:text-white ">
                    Coming Soon
                  </span>
                )}
              </div>
            </>
          );

          return isDisabled ? (
            <div key={key} className={className} aria-disabled="true">
              {content}
            </div>
          ) : (
            <Link href={`/explore/${key}`} key={key} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
