"use client";

import { cn } from "@/lib/utils";
import type { SessionBillingOperationalStatus } from "@/lib/session-validation";

export type SessionBillingFilterValue =
  | "ALL"
  | SessionBillingOperationalStatus;

const options: Array<{
  value: SessionBillingFilterValue;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "READY_TO_BILL", label: "Ready to bill" },
  { value: "AT_RISK", label: "At risk" },
  { value: "NOT_BILLABLE", label: "Not billable" },
];

export function SessionBillingFilter({
  value,
  onChange,
}: {
  value: SessionBillingFilterValue;
  onChange: (value: SessionBillingFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-white text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
