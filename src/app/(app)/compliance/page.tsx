import Link from "next/link";
import { AlertTriangle, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";

import { IssueTypeBadge } from "@/components/issue-type-badge";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/lib/data";
import { formatDate, formatCurrency } from "@/lib/format";
import { getDocuments, getFormPackets } from "@/lib/operations-data";
import { getBillingReadinessChecks, getOperationalMetrics } from "@/lib/operational-intelligence";

export default async function CompliancePage() {
  const [clients, documents, forms] = await Promise.all([
    getClients(),
    getDocuments(),
    getFormPackets(),
  ]);

  const operational = getOperationalMetrics(clients, documents, forms);
  const readiness = getBillingReadinessChecks(clients);
  const critical = operational.operationalIssues.filter((issue) => issue.severity === "HIGH");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Compliance center
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Compliance center and operational risk
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              This is where the real operational gaps live: pending notes, expired authorizations, missing required documents, and sessions that are not ready to bill today.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Critical Issues"
          value={String(critical.length)}
          hint="High-severity risks already affecting continuity or revenue."
          icon={TriangleAlert}
        />
        <MetricCard
          title="Billing Readiness"
          value={`${Math.round(operational.summary.readinessRate)}%`}
          hint="Sessions ready to move into billing without blockers."
          icon={ShieldCheck}
        />
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(operational.summary.revenueAtRiskCents)}
          hint="Estimated value held by non-ready sessions."
          icon={AlertTriangle}
        />
        <MetricCard
          title="Missing Docs"
          value={String(operational.summary.missingDocumentCount)}
          hint="Cases missing required documentation."
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Issue queue</CardTitle>
            <CardDescription>
              Prioritized by severity for daily operations management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operational.operationalIssues.map((issue) => (
              <Link
                key={issue.id}
                href={issue.href}
                className="block rounded-[24px] border border-border bg-white/70 p-5 transition-colors hover:bg-white"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{issue.title}</p>
                      <IssueTypeBadge type={issue.type} />
                      <StatusBadge value={issue.severity} />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {issue.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Owner: {issue.owner}
                    </p>
                  </div>
                    <div className="rounded-[18px] bg-accent/50 px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">
                      {issue.dueDate ? formatDate(issue.dueDate) : "No due date"}
                    </p>
                    <p className="text-muted-foreground">Due / follow-up</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Billing readiness checks</CardTitle>
            <CardDescription>
              Operational validation of sessions before they move to claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {readiness.slice(0, 8).map((check) => (
              <div key={check.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{check.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {check.caseLabel} · {check.serviceLabel}
                    </p>
                  </div>
                  <StatusBadge value={check.readyToBill ? "ACTIVE" : "HIGH"} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Readiness score</span>
                  <span className="font-medium text-foreground">
                    {Math.round(check.readinessScore)}%
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {check.blockers.map((blocker) => (
                    <p key={blocker} className="text-sm text-rose-700">
                      {blocker}
                    </p>
                  ))}
                  {check.warnings.map((warning) => (
                    <p key={warning} className="text-sm text-amber-700">
                      {warning}
                    </p>
                  ))}
                  {!check.blockers.length && !check.warnings.length ? (
                    <p className="text-sm text-emerald-700">Ready for billing.</p>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
