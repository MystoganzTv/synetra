import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  Files,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { CaseSessionTimeline } from "@/components/case-session-timeline";
import { IssueTypeBadge } from "@/components/issue-type-badge";
import { MetricCard } from "@/components/metric-card";
import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCase } from "@/lib/data";
import {
  flattenBilling,
  flattenCompliance,
  flattenProgressNotes,
  flattenSessions,
  getAuthorizationUtilization,
  getSessionEmployeeName,
  getSessionEmployeeTitle,
} from "@/lib/domain";
import { formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/format";
import { getOperationalIssues } from "@/lib/operational-intelligence";
import { getDocuments, getFormPackets } from "@/lib/operations-data";
import { validateSession } from "@/lib/session-validation";

function getCaseBillingStatus(
  readyCount: number,
  atRiskCount: number,
  notBillableCount: number,
) {
  if (notBillableCount > 0) return "NOT_BILLABLE" as const;
  if (atRiskCount > 0 || readyCount === 0) return "AT_RISK" as const;
  return "READY_TO_BILL" as const;
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const [{ caseId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { created?: string }),
  ]);
  const [record, documents, forms] = await Promise.all([
    getCase(caseId),
    getDocuments(),
    getFormPackets(),
  ]);

  if (!record) {
    notFound();
  }

  const { client, caseRecord } = record;
  const caseSessions = flattenSessions([client]).filter(
    ({ caseRecord: sessionCase }) => sessionCase.id === caseRecord.id,
  );
  const notes = flattenProgressNotes([client]).filter(
    ({ caseRecord: noteCase }) => noteCase.id === caseRecord.id,
  );
  const billing = flattenBilling([client]).filter(
    ({ caseRecord: billingCase }) => billingCase.id === caseRecord.id,
  );
  const compliance = flattenCompliance([client]).filter(
    ({ caseRecord: complianceCase }) => complianceCase.id === caseRecord.id,
  );

  const caseDocuments = documents.filter(
    (document) =>
      document.caseId === caseRecord.id ||
      (document.clientId === client.id && !document.caseId),
  );
  const caseForms = forms.filter(
    (form) => form.caseId === caseRecord.id || (!form.caseId && form.clientId === client.id),
  );
  const caseAlerts = getOperationalIssues([client], caseDocuments, caseForms).filter(
    (issue) => issue.caseId === caseRecord.id || (!issue.caseId && issue.clientId === client.id),
  );

  const sessionFlow = caseSessions
    .map((context) => {
      const validation = validateSession(context);

      return {
        ...context,
        validation,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.session.scheduledStart).getTime() -
        new Date(left.session.scheduledStart).getTime(),
    );

  const readyToBillCount = sessionFlow.filter(
    ({ validation }) => validation.billingStatus === "READY_TO_BILL",
  ).length;
  const atRiskCount = sessionFlow.filter(
    ({ validation }) => validation.billingStatus === "AT_RISK",
  ).length;
  const notBillableCount = sessionFlow.filter(
    ({ validation }) => validation.billingStatus === "NOT_BILLABLE",
  ).length;
  const caseBillingStatus = getCaseBillingStatus(
    readyToBillCount,
    atRiskCount,
    notBillableCount,
  );
  const averageReadiness =
    sessionFlow.length === 0
      ? 0
      : sessionFlow.reduce(
          (sum, { validation }) => sum + validation.readinessScore,
          0,
        ) / sessionFlow.length;

  const totalBilled = billing.reduce(
    (sum, { billingRecord }) => sum + billingRecord.amountCents,
    0,
  );
  const heldRevenue = billing
    .filter(
      ({ billingRecord }) =>
        billingRecord.status === "HOLD" || billingRecord.status === "DENIED",
    )
    .reduce((sum, { billingRecord }) => sum + billingRecord.amountCents, 0);
  const openComplianceCount = compliance.filter(
    ({ complianceItem }) => complianceItem.status === "OPEN",
  ).length;
  const expiringDocuments = caseDocuments.filter(
    (document) => document.status === "EXPIRING" || document.status === "EXPIRED",
  ).length;
  const wasCreated = query.created === "case";

  return (
    <div className="space-y-6">
      {wasCreated ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-emerald-700">
              Caso creado. Ahora puedes registrar la primera actividad y luego su nota.
            </p>
            <Button asChild size="sm">
              <Link href={`/cases/${caseRecord.id}/sessions/new`}>Agregar actividad</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden bg-white/86">
        <CardContent className="grid gap-6 px-6 py-7 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Case hub
              </p>
              <StatusBadge value={caseRecord.status} />
              <StatusBadge value={caseRecord.caseType} />
              <SessionBillingStatusBadge status={caseBillingStatus} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {caseRecord.programName}
              </h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {caseRecord.caseNumber} · {client.firstName} {client.lastName} · Lead{" "}
                {caseRecord.clinicalLead}
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              This case page acts as the operational brain for the episode: services,
              authorizations, sessions, notes, documents, billing status, and alerts all roll up
              here.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/cases">Back to cases</Link>
              </Button>
              <Button asChild>
                <Link href={`/cases/${caseRecord.id}/sessions/new`}>Nueva actividad</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/clients/${client.id}`}>Open client</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Client
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {client.firstName} {client.lastName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{client.externalId}</p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Payer
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {caseRecord.payerName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{caseRecord.location}</p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Billing status
              </p>
              <div className="mt-2">
                <SessionBillingStatusBadge status={caseBillingStatus} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {readyToBillCount} ready · {atRiskCount} at risk · {notBillableCount} not billable
              </p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Alerts
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {caseAlerts.length} active alert(s)
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {openComplianceCount} compliance · {expiringDocuments} document risk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Services"
          value={String(caseRecord.services.length)}
          hint="Service lines currently active under this episode."
          icon={CalendarClock}
        />
        <MetricCard
          title="Authorizations"
          value={String(caseRecord.services.flatMap((service) => service.authorizations).length)}
          hint="Coverage records tied to this case."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Documents"
          value={String(caseDocuments.length)}
          hint="Case and client documents relevant to this episode."
          icon={Files}
        />
        <MetricCard
          title="Billed Value"
          value={formatCurrency(totalBilled)}
          hint="Total billed value generated from this case."
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Service structure, disciplines, and utilization context for the case.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseRecord.services.map((service) => (
              <div key={service.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {service.serviceCode} · {service.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {service.frequency} · {service.discipline} · default {service.defaultUnitsPerSession}{" "}
                      units per session
                    </p>
                  </div>
                  <StatusBadge value={service.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Billing status</CardTitle>
            <CardDescription>
              Case-level billing readiness based on session validation flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-white/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Overall case billing posture</p>
                  <div className="mt-2">
                    <SessionBillingStatusBadge status={caseBillingStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Average readiness</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatPercent(averageReadiness)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={averageReadiness} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-accent/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Ready to bill
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{readyToBillCount}</p>
              </div>
              <div className="rounded-[20px] bg-accent/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  At risk
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{atRiskCount}</p>
              </div>
              <div className="rounded-[20px] bg-accent/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Not billable
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{notBillableCount}</p>
              </div>
              <div className="rounded-[20px] bg-accent/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Held revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(heldRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Authorizations</CardTitle>
            <CardDescription>
              Coverage windows, remaining units, and utilization thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseRecord.services.flatMap((service) =>
              service.authorizations.map((authorization) => {
                const utilization = getAuthorizationUtilization(authorization);

                return (
                  <div key={authorization.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {authorization.authorizationNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service.serviceCode} · {authorization.payerName}
                        </p>
                      </div>
                      <StatusBadge value={authorization.status} />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {formatDate(authorization.startDate)} to {formatDate(authorization.endDate)}
                        </span>
                        <span>
                          {authorization.remainingUnits} {authorization.unitType.toLowerCase()} remaining
                        </span>
                      </div>
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
              }),
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Operational alerts affecting documentation, authorization, or billability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseAlerts.length ? (
              caseAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="block rounded-[24px] border border-border bg-white/70 p-5 transition-colors hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <IssueTypeBadge type={alert.type} />
                    <StatusBadge value={alert.severity} />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{alert.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Owner {alert.owner}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-border bg-white/70 p-5">
                <p className="font-semibold text-foreground">No active alerts</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This case currently has no document, note, authorization, or billing alerts.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Sessions timeline</CardTitle>
            <CardDescription>
              Delivery history with real validation and billing flow attached to each session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaseSessionTimeline
              items={sessionFlow.map(({ service, session, validation }) => ({
                sessionId: session.id,
                serviceLabel: service
                  ? `${service.serviceCode} · ${service.title}`
                  : "Unlinked service",
                scheduledStartLabel: formatDateTime(session.scheduledStart),
                clinicianLabel: `${getSessionEmployeeName(session)}, ${getSessionEmployeeTitle(session)} · ${session.location}`,
                attendanceStatus: session.attendanceStatus,
                noteStatus: session.noteStatus,
                billingStatus: validation.billingStatus,
                validationStatus: validation.validationStatus,
                readinessScore: validation.readinessScore,
                unitsNeeded: validation.unitsNeeded,
                unitsRemaining: validation.unitsRemaining,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Progress notes attached to this case and their downstream billing state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notes.map(({ progressNote, session }) => (
              <div key={progressNote.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{progressNote.authorName}</p>
                  <StatusBadge value={progressNote.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Session {formatDateTime(session.scheduledStart)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {progressNote.assessment}
                </p>
                {progressNote.billingRecords.map((billingRecord) => (
                  <div key={billingRecord.id} className="mt-3 rounded-[18px] bg-accent/45 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {billingRecord.claimNumber}
                      </p>
                      <StatusBadge value={billingRecord.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {billingRecord.cptCode} · {formatCurrency(billingRecord.amountCents)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {sessionFlow.length === 0 ? (
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Sin actividad todavia</CardTitle>
            <CardDescription>
              El caso ya existe y el servicio base esta listo. Registra la primera llamada, outreach o coordinacion para empezar la documentacion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/cases/${caseRecord.id}/sessions/new`}>Agregar primera actividad</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Documents tied to the case or inherited from the client context for this episode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseDocuments.length ? (
              caseDocuments.map((document) => (
                <div key={document.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{document.title}</p>
                    <StatusBadge value={document.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {document.category} · owner {document.owner}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {document.expiresAt
                      ? `Expires ${formatDate(document.expiresAt)}`
                      : "No expiration date"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-border bg-white/70 p-5">
                <p className="font-semibold text-foreground">No linked documents</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No case-level or inherited client documents are currently linked to this case.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Revenue pipeline</CardTitle>
            <CardDescription>
              Claim and billing outcomes generated by this case.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billing.length ? (
              billing.map(({ billingRecord }) => (
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
              ))
            ) : (
              <div className="rounded-[24px] border border-border bg-white/70 p-5">
                <p className="font-semibold text-foreground">No billing records yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Billing records will appear here as sessions move through claim processing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
