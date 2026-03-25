"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SessionBillingFilter } from "@/components/session-billing-filter";
import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { SessionValidationStatusBadge } from "@/components/session-validation-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SessionBillingOperationalStatus, SessionValidationStatus } from "@/lib/session-validation";

interface CaseSessionTimelineItem {
  sessionId: string;
  serviceLabel: string;
  scheduledStartLabel: string;
  clinicianLabel: string;
  attendanceStatus: string;
  noteStatus: string;
  billingStatus: SessionBillingOperationalStatus;
  validationStatus: SessionValidationStatus;
  readinessScore: number;
  unitsNeeded: number;
  unitsRemaining: number;
}

export function CaseSessionTimeline({
  items,
}: {
  items: CaseSessionTimelineItem[];
}) {
  const [filter, setFilter] = useState<"ALL" | SessionBillingOperationalStatus>("ALL");

  const filteredItems = useMemo(
    () =>
      filter === "ALL"
        ? items
        : items.filter((item) => item.billingStatus === filter),
    [filter, items],
  );

  return (
    <div className="space-y-4">
      <SessionBillingFilter value={filter} onChange={setFilter} />
      {filteredItems.map((item) => (
        <div key={item.sessionId} className="rounded-[24px] border border-border bg-white/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-foreground">{item.scheduledStartLabel}</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={item.attendanceStatus} />
              <StatusBadge value={item.noteStatus} />
              <SessionBillingStatusBadge status={item.billingStatus} />
              <SessionValidationStatusBadge status={item.validationStatus} />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.serviceLabel}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.clinicianLabel}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {item.unitsNeeded} units needed · {item.unitsRemaining} remaining
            </span>
            <span className="font-medium text-foreground">
              {Math.round(item.readinessScore)}%
            </span>
          </div>
          <div className="mt-3">
            <Progress value={item.readinessScore} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/sessions/${item.sessionId}`}>Open session</Link>
            </Button>
          </div>
        </div>
      ))}
      {filteredItems.length === 0 ? (
        <div className="rounded-[24px] border border-border bg-white/70 p-5">
          <p className="font-semibold text-foreground">No sessions match this filter</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Change the billing filter to inspect other sessions in this case.
          </p>
        </div>
      ) : null}
    </div>
  );
}
