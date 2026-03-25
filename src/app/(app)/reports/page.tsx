import Link from "next/link";
import { BarChart3, CircleDollarSign, FileClock, ShieldAlert } from "lucide-react";

import { IssueTypeBadge } from "@/components/issue-type-badge";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationalIssueType } from "@/lib/operational-intelligence";
import { Progress } from "@/components/ui/progress";
import { getClients } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getDocuments, getFormPackets } from "@/lib/operations-data";
import { getOperationalMetrics } from "@/lib/operational-intelligence";

export default async function ReportsPage() {
  const [clients, documents, forms] = await Promise.all([
    getClients(),
    getDocuments(),
    getFormPackets(),
  ]);

  const operational = getOperationalMetrics(clients, documents, forms);
  const { summary, readinessChecks, operationalIssues } = operational;
  const issuesByType = [
    "MISSING_NOTE",
    "EXPIRED_AUTHORIZATION",
    "MISSING_REQUIRED_DOCUMENT",
    "NON_BILLABLE_SESSION",
    "BILLING_READINESS",
  ].map((type) => ({
    type,
    count: operationalIssues.filter((issue) => issue.type === type).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Reports
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Operational reporting and actionable metrics
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              This layer turns clinical and administrative data into operating signals across billing, compliance, documentation, and coverage.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Billing Ready"
          value={String(summary.readyToBillCount)}
          hint="Sessions that already meet operational gates."
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Not Ready"
          value={String(summary.notReadyToBillCount)}
          hint="Sessions still carrying blockers or warnings."
          icon={FileClock}
        />
        <MetricCard
          title="Authorization Coverage"
          value={formatPercent(summary.authorizationCoverageRate)}
          hint="Percentage of authorizations still active."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Average Score"
          value={formatPercent(summary.averageReadinessScore)}
          hint="Average operational maturity across the pipeline."
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Core KPIs</CardTitle>
            <CardDescription>
              Summary metrics for clinical operations and revenue cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall billing readiness</span>
                <span className="font-medium text-foreground">
                  {formatPercent(summary.readinessRate)}
                </span>
              </div>
              <Progress value={summary.readinessRate} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signed note rate</span>
                <span className="font-medium text-foreground">
                  {formatPercent(summary.signedNoteRate)}
                </span>
              </div>
              <Progress value={summary.signedNoteRate} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] bg-accent/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Total modeled revenue
                </p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatCurrency(summary.submittedRevenueCents)}
                </p>
              </div>
              <div className="rounded-[22px] bg-accent/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Revenue at risk
                </p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatCurrency(summary.revenueAtRiskCents)}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-border bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">Missing notes</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.missingNoteCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-border bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">Missing documents</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.missingDocumentCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-border bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">Expired authorizations</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.expiredAuthorizationCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-border bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">Non-billable sessions</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.nonBillableCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Issue distribution</CardTitle>
            <CardDescription>
              How the operational load is distributed by category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {issuesByType.map((entry) => (
              <div key={entry.type} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <IssueTypeBadge type={entry.type as OperationalIssueType} />
                  <span className="text-xl font-semibold text-foreground">{entry.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Detailed billing readiness</CardTitle>
            <CardDescription>
              Top sessions ranked by operational score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {readinessChecks.slice(0, 10).map((check) => (
              <div key={check.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{check.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {check.caseLabel} · {check.serviceLabel}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {Math.round(check.readinessScore)}%
                  </span>
                </div>
                <div className="mt-3">
                  <Progress value={check.readinessScore} />
                </div>
                {check.blockers.length ? (
                  <div className="mt-4 space-y-2">
                    {check.blockers.map((blocker) => (
                      <p key={blocker} className="text-sm text-rose-700">
                        {blocker}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Priority actions</CardTitle>
            <CardDescription>
              The highest-value issues to resolve today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operationalIssues.slice(0, 8).map((issue) => (
              <Link
                key={issue.id}
                href={issue.href}
                className="block rounded-[24px] border border-border bg-white/70 p-5 transition-colors hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <IssueTypeBadge type={issue.type} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {issue.owner}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-foreground">{issue.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {issue.description}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
