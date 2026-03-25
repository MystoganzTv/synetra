import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  DollarSign,
  FileWarning,
  ShieldAlert,
  Users2,
} from "lucide-react";

import { IssueTypeBadge } from "@/components/issue-type-badge";
import { MetricCard } from "@/components/metric-card";
import { DashboardUpcomingSessions } from "@/components/dashboard-upcoming-sessions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/data";
import {
  getAuthorizationUtilization,
  getClientDisplayName,
  getSessionEmployeeName,
  getSessionEmployeeTitle,
} from "@/lib/domain";
import { formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/format";
import { getDocuments, getFormPackets } from "@/lib/operations-data";
import { getOperationalMetrics } from "@/lib/operational-intelligence";
import { validateSession } from "@/lib/session-validation";

export default async function DashboardPage() {
  const [dashboard, documents, forms] = await Promise.all([
    getDashboardData(),
    getDocuments(),
    getFormPackets(),
  ]);
  const operational = getOperationalMetrics(dashboard.clients, documents, forms);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border border-[#3146a0]/22 bg-[#0a122d] text-white shadow-[0_28px_72px_-46px_rgba(14,25,79,0.38)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_top,rgba(115,104,255,0.28),transparent_62%)]" />
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(86,176,255,0.16),transparent_68%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_28%,transparent_70%,rgba(126,107,255,0.08)_100%)]" />
        </div>
        <CardContent className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.45fr_0.85fr] lg:px-8 lg:py-9">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.045] px-3 py-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
                  Estado operativo
                </p>
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Synetra reúne la operación de salud conductual en un centro de control moderno.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/80">
                Flujos conectados de clientes, casos, autorizaciones, sesiones, notas, facturación y cumplimiento con visibilidad operativa más clara.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="contrast"
                className="h-11 !border-white/45 !bg-[rgba(248,250,255,0.98)] !px-5 !text-[#182454] shadow-md shadow-[#081238]/14 hover:!bg-white"
              >
                <Link href="/clients">
                  Abrir clientes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-white/14 bg-[rgba(8,18,56,0.18)] px-5 text-white shadow-none hover:bg-[rgba(8,18,56,0.32)]"
              >
                <Link href="/compliance">Abrir centro de cumplimiento</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/74">Actualizado al</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatDate(dashboard.referenceDate)}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Datos actuales del workspace sobre prestación de servicios, autorizaciones, notas, reclamos y señales de control.
              </p>
            </div>
            <div className="my-5 h-px bg-white/10" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/74">Documentación completada</p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold tracking-tight text-white">
                  {formatPercent(dashboard.documentationCompletion)}
                </p>
                <p className="max-w-[13rem] text-right text-sm leading-6 text-white/68">
                  según notas firmadas frente a pendientes
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#74c2ff_0%,#8e79ff_100%)]"
                  style={{ width: formatPercent(dashboard.documentationCompletion) }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Clientes activos"
          value={String(dashboard.activeClients)}
          hint="Cartera actual de tratamiento con episodios de atención activos."
          icon={Users2}
        />
        <MetricCard
          title="Casos activos"
          value={String(dashboard.activeCases)}
          hint="Programas abiertos de salud conductual en prestación de servicios."
          icon={Activity}
        />
        <MetricCard
          title="Notas sin firma"
          value={String(dashboard.unsignedNotes)}
          hint="Notas en borrador o pendientes de firma que requieren seguimiento."
          icon={FileWarning}
        />
        <MetricCard
          title="Reclamos listos o en curso"
          value={formatCurrency(dashboard.submittedRevenue)}
          hint="Valor actual entre reclamos listos, enviados y pagados."
          icon={DollarSign}
        />
        <MetricCard
          title="Listo para facturar"
          value={formatPercent(operational.summary.readinessRate)}
          hint="Porcentaje de sesiones listas para pasar a reclamación sin bloqueos."
          icon={BarChart3}
        />
        <MetricCard
          title="Ingresos en riesgo"
          value={formatCurrency(operational.summary.revenueAtRiskCents)}
          hint="Valor estimado detenido por sesiones no listas o no facturables."
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Sesiones próximas</CardTitle>
            <CardDescription>
              Vista de agenda inmediata entre clientes, casos y clínicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardUpcomingSessions
              items={dashboard.upcomingSessions.map((context) => {
                const { client, caseRecord, service, session } = context;
                const validation = validateSession(context);

                return {
                  sessionId: session.id,
                  clientId: client.id,
                  clientName: getClientDisplayName(client),
                  caseId: caseRecord.id,
                  caseLabel: caseRecord.programName,
                  serviceLabel: service
                    ? `${service.serviceCode} ${service.title}`
                    : "Servicio sin vincular",
                  scheduledStartLabel: formatDateTime(session.scheduledStart),
                  location: session.location,
                  clinicianLabel: `${getSessionEmployeeName(session)}, ${getSessionEmployeeTitle(session)}`,
                  attendanceStatus: session.attendanceStatus,
                  billingStatus: validation.billingStatus,
                  validationStatus: validation.validationStatus,
                };
              })}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/82">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Inteligencia operativa</CardTitle>
                  <CardDescription>
                    Incidencias detectadas automáticamente por reglas operativas.
                  </CardDescription>
                </div>
                <Button asChild variant="ghost">
                  <Link href="/reports">Ver reportes</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {operational.operationalIssues.slice(0, 4).map((issue) => (
                <Link
                  key={issue.id}
                  href={issue.href}
                  className="block rounded-[24px] border border-border bg-white/70 p-4 transition-colors hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <IssueTypeBadge type={issue.type} />
                    <StatusBadge value={issue.severity} />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{issue.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {issue.description}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Riesgo de autorización</CardTitle>
              <CardDescription>
                Autorizaciones por vencer o con uso alto que requieren acción.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.authorizationsAtRisk.map(
                ({ client, caseRecord, service, authorization }) => {
                  const utilization = getAuthorizationUtilization(authorization);

                  return (
                    <div key={authorization.id} className="space-y-3 rounded-[24px] border border-border bg-white/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {getClientDisplayName(client)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {service.serviceCode} · {caseRecord.caseNumber}
                          </p>
                        </div>
                        <StatusBadge value={authorization.status} />
                      </div>
                      <Progress value={utilization} />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {authorization.usedUnits}/{authorization.approvedUnits}{" "}
                          {authorization.unitType.toLowerCase()}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPercent(utilization)}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Cola de cumplimiento</CardTitle>
              <CardDescription>
                Elementos abiertos que requieren seguimiento clínico, de utilización o de ingresos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.openCompliance.map(({ complianceItem, client, caseRecord }) => (
                <div key={complianceItem.id} className="rounded-[24px] border border-border bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{complianceItem.title}</p>
                    <StatusBadge value={complianceItem.severity} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {complianceItem.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{getClientDisplayName(client)}</span>
                    <span>{caseRecord.caseNumber}</span>
                    <span>{complianceItem.owner}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Capacidad por líder clínico</CardTitle>
            <CardDescription>
              Carga de casos y sesiones de corto plazo por líder de atención.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {dashboard.caseLoadByLead.map((lead) => (
              <div key={lead.lead} className="rounded-[24px] border border-border bg-white/70 p-5">
                <p className="font-semibold text-foreground">{lead.lead}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Casos</p>
                    <p className="mt-1 text-xl font-semibold">{lead.activeCases}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clientes</p>
                    <p className="mt-1 text-xl font-semibold">{lead.activeClients}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sesiones a 7 días</p>
                    <p className="mt-1 text-xl font-semibold">{lead.sessionsNext7Days}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Resumen de preparación de facturación</CardTitle>
            <CardDescription>
              Sesiones con menor puntaje operativo antes de llegar a reclamación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operational.readinessChecks.slice(0, 5).map((check) => (
              <Link
                key={check.id}
                href="/compliance"
                className="block rounded-[24px] border border-border bg-white/70 p-5 transition-colors hover:bg-white"
              >
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
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
