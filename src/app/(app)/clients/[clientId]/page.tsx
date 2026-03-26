import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, ShieldAlert, Wallet } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getClient } from "@/lib/data";
import {
  flattenAuthorizations,
  flattenBilling,
  flattenCases,
  flattenCompliance,
  flattenSessions,
  getAuthorizationUtilization,
  getClientDisplayName,
  getFullLegalName,
  getNextSessionForClient,
  getSessionEmployeeName,
  getSessionEmployeeTitle,
} from "@/lib/domain";
import {
  calculateAge,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/format";
import {
  getSynchronizedSessionBillingStatus,
  validateSession,
} from "@/lib/session-validation";
import { getNow } from "@/lib/time";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const [{ clientId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { created?: string }),
  ]);
  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  const caseContexts = flattenCases([client]);
  const authorizations = flattenAuthorizations([client]);
  const sessions = flattenSessions([client]).sort(
    (left, right) =>
      new Date(right.session.scheduledStart).getTime() -
      new Date(left.session.scheduledStart).getTime(),
  );
  const compliance = flattenCompliance([client]);
  const billing = flattenBilling([client]);
  const referenceDate = getNow();
  const nextSession = getNextSessionForClient(client, referenceDate);
  const openCompliance = compliance.filter(
    ({ complianceItem }) => complianceItem.status === "OPEN",
  );
  const claimExposure = billing
    .filter(
      ({ billingRecord }) =>
        billingRecord.status === "READY" ||
        billingRecord.status === "SUBMITTED" ||
        billingRecord.status === "PAID",
    )
    .reduce((sum, { billingRecord }) => sum + billingRecord.amountCents, 0);
  const wasCreated = query.created === "client";
  const documentUploaded = query.created === "document";

  return (
    <div className="space-y-6">
      {wasCreated ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-emerald-700">
              Client created. The next recommended step is to open the first case.
            </p>
            <Button asChild size="sm">
              <Link href={`/clients/${client.id}/cases/new`}>Create first case</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {documentUploaded ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 text-sm text-emerald-700">
            Document uploaded successfully.
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden bg-white/86">
        <CardContent className="grid gap-6 px-6 py-7 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Client detail
              </p>
              <StatusBadge value={client.status} />
              <StatusBadge value={client.riskLevel} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {getClientDisplayName(client)}
              </h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {getFullLegalName(client)} · {client.externalId} · DOB {formatDate(client.dateOfBirth)} ·{" "}
                {calculateAge(client.dateOfBirth)} years old
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {client.referralSource} referral with {client.payerSegment ?? "unassigned payer segment"} coverage and a primary diagnosis of{" "}
              {client.primaryDiagnosisCode ?? "pending diagnostic entry"}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/clients">Back to roster</Link>
              </Button>
              <Button asChild>
                <Link href={`/clients/${client.id}/cases/new`}>New case</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/documents/new?clientId=${client.id}`}>Upload document</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cases">Open case operations</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Contact
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{client.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">{client.phone}</p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Geography
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {[client.city, client.state].filter(Boolean).join(", ")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{client.timezone}</p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Next touchpoint
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {nextSession ? formatDateTime(nextSession.scheduledStart) : "No future session"}
              </p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Open compliance
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {openCompliance.length} active item(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Cases"
          value={String(caseContexts.length)}
          hint="All open and historical episodes tied to this client."
          icon={CalendarClock}
        />
        <MetricCard
          title="Authorizations"
          value={String(authorizations.length)}
          hint="Coverage spans across the client service stack."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Recent Sessions"
          value={String(sessions.length)}
          hint="Rendered and scheduled visits currently modeled."
          icon={FileText}
        />
        <MetricCard
          title="Claim Exposure"
          value={formatCurrency(claimExposure)}
          hint="Claim value currently flowing through billing."
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Case Portfolio</CardTitle>
            <CardDescription>
              Active and historical episodes connected to this client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseContexts.length > 0 ? (
              caseContexts.map(({ caseRecord }) => (
                <div key={caseRecord.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/cases/${caseRecord.id}`}
                          className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {caseRecord.programName}
                        </Link>
                        <StatusBadge value={caseRecord.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {caseRecord.caseNumber} · {caseRecord.payerName} · Lead {caseRecord.clinicalLead}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {caseRecord.carePlanSummary}
                      </p>
                    </div>
                    <Button asChild variant="ghost">
                      <Link href={`/cases/${caseRecord.id}`}>Open case</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-accent/40 p-5">
                <p className="text-lg font-semibold text-foreground">No open cases yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This client already exists in the roster. The next operational step is to open the first case and start documenting activity.
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href={`/clients/${client.id}/cases/new`}>Create first case</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Authorization Coverage</CardTitle>
            <CardDescription>
              Utilization and expiration posture across the current care plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authorizations.map(({ service, authorization }) => {
              const utilization = getAuthorizationUtilization(authorization);

              return (
                <div key={authorization.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {service.serviceCode} · {service.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {authorization.authorizationNumber} · ends {formatDate(authorization.endDate)}
                      </p>
                    </div>
                    <StatusBadge value={authorization.status} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Progress value={utilization} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {authorization.usedUnits}/{authorization.approvedUnits} used
                      </span>
                      <span className="font-medium text-foreground">
                        {formatPercent(utilization)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Session Timeline</CardTitle>
            <CardDescription>
              Most recent activity across direct service, supervision, and coordination.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.slice(0, 6).map((context) => (
              <div key={context.session.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                {(() => {
                  const { caseRecord, service, session } = context;
                  const validation = validateSession(context);

                  return (
                    <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {formatDateTime(session.scheduledStart)}
                  </p>
                  <div className="flex gap-2">
                    <StatusBadge value={session.attendanceStatus} />
                    <StatusBadge value={session.noteStatus} />
                    <StatusBadge value={getSynchronizedSessionBillingStatus(context)} />
                    <SessionBillingStatusBadge status={validation.billingStatus} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {caseRecord.programName} · {service ? `${service.serviceCode} ${service.title}` : "Unlinked service"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getSessionEmployeeName(session)}, {getSessionEmployeeTitle(session)} · {session.location}
                </p>
                <div className="mt-3 flex justify-end">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/sessions/${session.id}`}>Open session</Link>
                  </Button>
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Compliance and Billing</CardTitle>
            <CardDescription>
              Open QA issues and claims needing oversight for this client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openCompliance.map(({ complianceItem, caseRecord }) => (
              <div key={complianceItem.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{complianceItem.title}</p>
                  <StatusBadge value={complianceItem.severity} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {complianceItem.description}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {caseRecord.caseNumber} · owner {complianceItem.owner}
                </p>
              </div>
            ))}

            {billing
              .filter(
                ({ billingRecord }) =>
                  billingRecord.status === "HOLD" || billingRecord.status === "DENIED",
              )
              .map(({ billingRecord }) => (
                <div key={billingRecord.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{billingRecord.claimNumber}</p>
                    <StatusBadge value={billingRecord.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {billingRecord.cptCode} · {formatCurrency(billingRecord.amountCents)}
                  </p>
                  {billingRecord.denialReason ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {billingRecord.denialReason}
                    </p>
                  ) : null}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
