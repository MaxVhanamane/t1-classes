import HardReloadButton from "@/src/components/hard-reload-button";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0112 10c-2.42 0-4.68.78-6.53 2.11M5.16 5.16A10.94 10.94 0 0112 3c5.52 0 10 4.48 10 10 0 1.61-.38 3.14-1.06 4.5"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight">
          You are offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground">
          It looks like your internet connection is lost. Some features may be
          unavailable until you are back online.
        </p>

        {/* Retry button */}
        <HardReloadButton />
      </div>
    </main>
  );
}
