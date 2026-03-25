"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SessionBillingFilter } from "@/components/session-billing-filter";
import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { SessionBillingOperationalStatus, SessionValidationStatus } from "@/lib/session-validation";

interface DashboardUpcomingSessionItem {
  sessionId: string;
  clientId: string;
  clientName: string;
  caseId: string;
  caseLabel: string;
  serviceLabel: string;
  scheduledStartLabel: string;
  location: string;
  clinicianLabel: string;
  attendanceStatus: string;
  billingStatus: SessionBillingOperationalStatus;
  validationStatus: SessionValidationStatus;
}

export function DashboardUpcomingSessions({
  items,
}: {
  items: DashboardUpcomingSessionItem[];
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
        <div
          key={item.sessionId}
          className="rounded-[24px] border border-border bg-white/75 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/clients/${item.clientId}`}
                  className="text-base font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {item.clientName}
                </Link>
                <StatusBadge value={item.attendanceStatus} />
                <SessionBillingStatusBadge status={item.billingStatus} />
              </div>
              <p className="text-sm text-muted-foreground">
                {item.caseLabel} · {item.serviceLabel}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{item.scheduledStartLabel}</span>
                <span>{item.location}</span>
                <span>{item.clinicianLabel}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="ghost" className="justify-start lg:justify-center">
                <Link href={`/sessions/${item.sessionId}`}>Abrir sesión</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start lg:justify-center">
                <Link href={`/cases/${item.caseId}`}>Abrir caso</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
      {filteredItems.length === 0 ? (
        <div className="rounded-[24px] border border-border bg-white/70 p-5">
          <p className="font-semibold text-foreground">No hay sesiones para este filtro</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cambia el filtro de facturación para ver otras sesiones próximas.
          </p>
        </div>
      ) : null}
    </div>
  );
}
