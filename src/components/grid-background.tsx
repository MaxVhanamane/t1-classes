import { cn } from "@/src/lib/utils";

export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        "bg-white dark:bg-black",
        className,
      )}
    >
      {/* Soft center glow */}
      <div className="absolute inset-0">
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
            "bg-black/[0.03]",
            "dark:bg-white/[0.04]",
          )}
        />
      </div>

      {/* Grid */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[size:36px_36px]",
          "[background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]",
        )}
      />

      {/* Fade grid toward center */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-white dark:bg-black",
          "[mask-image:radial-gradient(circle_at_center,transparent_25%,black_85%)]",
        )}
      />

      {/* Vignette */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.12)_100%)]",
          "dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]",
        )}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
