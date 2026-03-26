import Link from "next/link";
import { ArrowRight, ClipboardList, Plus, ShieldAlert, Users2 } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCases } from "@/lib/data";
import {
  flattenCompliance,
  flattenSessions,
  getAuthorizationUtilization,
  getCaseUtilization,
  getNextSessionForCase,
} from "@/lib/domain";
import { formatDateTime, formatPercent } from "@/lib/format";
import { validateSession } from "@/lib/session-validation";
import { getNow } from "@/lib/time";

export default async function CasesPage() {
  const cases = await getCases();
  const referenceDate = getNow();
  const activeCases = cases.filter(({ caseRecord }) => caseRecord.status === "ACTIVE").length;
  const holdCases = cases.filter(({ caseRecord }) => caseRecord.status === "ON_HOLD").length;
  const distinctLeads = new Set(cases.map(({ caseRecord }) => caseRecord.clinicalLead)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Cases
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Case operations across care delivery and utilization
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Each case brings together program design, payer coverage, clinical ownership, session volume, and downstream billing or compliance exposure.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/clients">
                Create case from client
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Case volume"
          value={String(cases.length)}
          hint="Open and historical episodes inside the tenant."
          icon={ClipboardList}
        />
        <MetricCard
          title="Active / on hold"
          value={`${activeCases} / ${holdCases}`}
          hint="Operational mix of active versus paused episodes."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Clinical leads"
          value={String(distinctLeads)}
          hint="Distinct clinical owners represented in the current panel."
          icon={Users2}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {cases.map(({ client, caseRecord }) => {
          const nextSession = getNextSessionForCase(caseRecord, referenceDate);
          const nextSessionContext = flattenSessions([client])
            .filter(({ caseRecord: sessionCase }) => sessionCase.id === caseRecord.id)
            .filter(({ session }) => new Date(session.scheduledStart) >= referenceDate)
            .sort(
              (left, right) =>
                new Date(left.session.scheduledStart).getTime() -
                new Date(right.session.scheduledStart).getTime(),
            )[0];
          const utilization = getCaseUtilization(caseRecord);
          const openCompliance = flattenCompliance([client]).filter(
            ({ caseRecord: complianceCase, complianceItem }) =>
              complianceCase.id === caseRecord.id && complianceItem.status === "OPEN",
          ).length;
          const highestAuthRisk = caseRecord.services
            .flatMap((service) => service.authorizations)
            .sort(
              (left, right) =>
                getAuthorizationUtilization(right) - getAuthorizationUtilization(left),
            )[0];

          return (
            <Card key={caseRecord.id} className="bg-white/82">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        {caseRecord.programName}
                      </h2>
                      <StatusBadge value={caseRecord.status} />
                      <StatusBadge value={caseRecord.caseType} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {caseRecord.caseNumber} · {client.firstName} {client.lastName} ·{" "}
                      {caseRecord.payerName}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Lead {caseRecord.clinicalLead} · {caseRecord.location}
                    </p>
                  </div>
                  <Button asChild variant="ghost">
                    <Link href={`/cases/${caseRecord.id}`}>
                      Open case
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[22px] bg-accent/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Next session
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {nextSession ? formatDateTime(nextSession.scheduledStart) : "No upcoming session"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-accent/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Open compliance
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {openCompliance}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-accent/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Highest authorization risk
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {highestAuthRisk
                        ? formatPercent(getAuthorizationUtilization(highestAuthRisk))
                        : "No authorizations"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-accent/70 p-4 md:col-span-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Billing status for next session
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {nextSession ? formatDateTime(nextSession.scheduledStart) : "No upcoming session"}
                      </p>
                      {nextSessionContext ? (
                        <SessionBillingStatusBadge
                          status={validateSession(nextSessionContext).billingStatus}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">No session</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall authorization utilization</span>
                    <span className="font-medium text-foreground">
                      {formatPercent(utilization)}
                    </span>
                  </div>
                  <Progress value={utilization} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
