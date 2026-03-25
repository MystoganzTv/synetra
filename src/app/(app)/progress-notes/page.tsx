import Link from "next/link";
import { ClipboardPen, FileClock, FileSignature, ShieldAlert } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SessionValidationStatusBadge } from "@/components/session-validation-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getProgressNotesModuleData } from "@/lib/operations-data";
import {
  getSynchronizedSessionBillingStatus,
  validateSession,
} from "@/lib/session-validation";

export default async function ProgressNotesPage() {
  const notesData = await getProgressNotesModuleData();
  const spotlight = notesData.spotlight;
  const spotlightValidation = spotlight ? validateSession(spotlight) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Progress notes
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Progress note queue with billing and compliance context
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Notes are surfaced as operational work items, not isolated clinical records, so teams can see signatures, claim blockers, and compliance exposure alongside the note itself.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Notes"
          value={String(notesData.metrics.total)}
          hint="All note records represented in the active workspace."
          icon={ClipboardPen}
        />
        <MetricCard
          title="Draft / Pending"
          value={`${notesData.metrics.draft} / ${notesData.metrics.pendingSignature}`}
          hint="Work still waiting on completion or signature."
          icon={FileClock}
        />
        <MetricCard
          title="Billing Blocks"
          value={String(notesData.metrics.billingBlocks)}
          hint="Claims held up downstream from note-related workflows."
          icon={FileSignature}
        />
        <MetricCard
          title="Open Compliance"
          value={String(notesData.metrics.openCompliance)}
          hint="QA items still attached to note records."
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Note Queue</CardTitle>
            <CardDescription>
              Prioritized by documentation due timing and unresolved issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notesData.notes.map((note) => (
              <div key={note.progressNote.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {note.client.firstName} {note.client.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {note.service ? note.service.serviceCode : "UNLINKED"} · {note.caseRecord.caseNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge value={note.progressNote.status} />
                    {note.isOverdue ? <StatusBadge value="EXPIRING" /> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {note.progressNote.assessment}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Due {formatDateTime(note.session.documentationDueAt)}</span>
                  <span>{note.billingIssues} billing issue(s)</span>
                  <span>{note.complianceCount} compliance item(s)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {spotlight ? (
          <Card className="bg-white/82">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>
                    {spotlight.client.firstName} {spotlight.client.lastName}
                  </CardTitle>
                  <CardDescription>
                    {spotlight.caseRecord.programName} · {spotlight.service ? spotlight.service.serviceCode : "UNLINKED"} ·{" "}
                    {formatDateTime(spotlight.session.scheduledStart)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={spotlight.progressNote.status} />
                  <StatusBadge value={getSynchronizedSessionBillingStatus(spotlight)} />
                  {spotlightValidation ? (
                    <SessionValidationStatusBadge status={spotlightValidation.validationStatus} />
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] bg-accent/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Author
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {spotlight.progressNote.authorName}
                  </p>
                </div>
                <div className="rounded-[22px] bg-accent/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Documentation due
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {formatDateTime(spotlight.session.documentationDueAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subjective</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {spotlight.progressNote.subjective}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Objective</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {spotlight.progressNote.objective}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assessment</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {spotlight.progressNote.assessment}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {spotlight.progressNote.plan}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="font-semibold text-foreground">Billing linkage</p>
                  <div className="mt-4 space-y-3">
                    {spotlight.progressNote.billingRecords.map((billingRecord) => (
                      <div key={billingRecord.id} className="rounded-[18px] bg-accent/45 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground">{billingRecord.claimNumber}</p>
                          <StatusBadge value={billingRecord.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {billingRecord.cptCode} · {billingRecord.unitsBilled} units
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="font-semibold text-foreground">Compliance linkage</p>
                  <div className="mt-4 space-y-3">
                    {spotlight.progressNote.complianceItems.map((complianceItem) => (
                      <div key={complianceItem.id} className="rounded-[18px] bg-accent/45 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground">{complianceItem.title}</p>
                          <StatusBadge value={complianceItem.severity} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {complianceItem.owner}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
