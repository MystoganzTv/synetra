import Link from "next/link";
import { ArrowRight, Plus, ShieldAlert, UsersRound, Wallet } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClients } from "@/lib/data";
import {
  flattenCompliance,
  getClientDisplayName,
  getNextSessionForClient,
} from "@/lib/domain";
import { calculateAge, formatDateTime } from "@/lib/format";
import { getNow } from "@/lib/time";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

export default async function ClientsPage() {
  const clients = (await getClients()).sort((left, right) => {
    if (left.cases.length === 0 && right.cases.length > 0) return -1;
    if (left.cases.length > 0 && right.cases.length === 0) return 1;

    return `${left.lastName} ${left.firstName}`.localeCompare(
      `${right.lastName} ${right.firstName}`,
    );
  });
  const referenceDate = getNow();
  const compliance = flattenCompliance(clients);
  const highRiskClients = clients.filter(
    (client) => client.riskLevel === "HIGH" || client.riskLevel === "MODERATE",
  ).length;
  const payerSegments = new Set(
    clients.map((client) => client.payerSegment).filter(Boolean),
  ).size;
  const clientsWithoutCases = clients.filter((client) => client.cases.length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Clientes
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Cartera de clientes con contexto operativo
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Una vista moderna de la cartera con demografía, riesgo, próximo contacto e incidencias de utilización o cumplimiento que importan al equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/clients/new">
                Nuevo cliente
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al panel</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Tamaño de cartera"
          value={String(clients.length)}
          hint="Incluye clientes activos, en pausa y dados de alta en el workspace actual."
          icon={UsersRound}
        />
        <MetricCard
          title="Riesgo moderado / alto"
          value={String(highRiskClients)}
          hint="Clientes que requieren más seguimiento o visibilidad de escalamiento."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Segmentos pagadores"
          value={String(payerSegments)}
          hint="Mezcla de cobertura representada en el workspace actual."
          icon={Wallet}
        />
        <MetricCard
          title="Sin caso todavia"
          value={String(clientsWithoutCases)}
          hint="Clientes en intake que aun no tienen un episodio abierto."
          icon={Plus}
        />
      </div>

      {clients.length === 0 ? (
        <Card className="bg-white/82">
          <CardContent className="flex flex-col gap-4 p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Aun no tienes clientes en cartera
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Este workspace ya esta limpio para tu usuario. El siguiente paso es crear tu primer cliente manualmente y desde ahi abrir su caso, actividad y nota.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/clients/new">
                  Crear primer cliente
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Volver al panel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {clients.map((client) => {
          const displayName = getClientDisplayName(client);
          const nextSession = getNextSessionForClient(client, referenceDate);
          const openCompliance = compliance.filter(
            ({ client: complianceClient, complianceItem }) =>
              complianceClient.id === client.id && complianceItem.status === "OPEN",
          ).length;
          const activeCases = client.cases.filter(
            (caseRecord) => caseRecord.status === "ACTIVE",
          ).length;

            return (
              <Card key={client.id} className="bg-white/82">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {displayName}
                          </h2>
                          <StatusBadge value={client.status} />
                          <StatusBadge value={client.riskLevel} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {client.externalId} · {calculateAge(client.dateOfBirth)} años ·{" "}
                          {[client.city, client.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost">
                      <Link href={`/clients/${client.id}`}>
                        Abrir expediente
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Diagnóstico
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {client.primaryDiagnosisCode ?? "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Casos activos
                      </p>
                      <p className="mt-2 font-semibold text-foreground">{activeCases}</p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Próxima sesión
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {nextSession ? formatDateTime(nextSession.scheduledStart) : "Sin visitas futuras"}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        QA abierta
                      </p>
                      <p className="mt-2 font-semibold text-foreground">{openCompliance}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {client.cases.length > 0 ? (
                      client.cases.map((caseRecord) => (
                        <Link
                          key={caseRecord.id}
                          href={`/cases/${caseRecord.id}`}
                          className="rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {caseRecord.caseNumber} · {caseRecord.programName}
                        </Link>
                      ))
                    ) : (
                      <Button asChild size="sm">
                        <Link href={`/clients/${client.id}/cases/new`}>
                          Crear primer caso
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
