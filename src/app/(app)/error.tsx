"use client";

import { AppErrorState } from "@/components/app-error-state";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <AppErrorState
        title="We couldn't load live operational data."
        description={error.message || "The requested module failed to load from the configured data source. Review server logs and database connectivity, then try again."}
      />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
