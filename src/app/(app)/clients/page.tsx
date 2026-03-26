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
          Clients
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Client roster with operational context
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              A modern roster view with demographics, risk, next touchpoint, and utilization or compliance signals that actually matter to the team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/clients/new">
                New client
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Roster size"
          value={String(clients.length)}
          hint="Includes active, on-hold, and intake clients in the current workspace."
          icon={UsersRound}
        />
        <MetricCard
          title="Moderate / high risk"
          value={String(highRiskClients)}
          hint="Clients who need tighter follow-up or escalation visibility."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Payer segments"
          value={String(payerSegments)}
          hint="Coverage mix represented in the current workspace."
          icon={Wallet}
        />
        <MetricCard
          title="No case yet"
          value={String(clientsWithoutCases)}
          hint="Intake clients who do not have an open episode yet."
          icon={Plus}
        />
      </div>

      {clients.length === 0 ? (
        <Card className="bg-white/82">
          <CardContent className="flex flex-col gap-4 p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                You do not have clients in your roster yet
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                This workspace is now clean for your user. The next step is to create your first client manually and then open the case, activity, and note from there.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/clients/new">
                  Create first client
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
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
                          {client.externalId} · {calculateAge(client.dateOfBirth)} years old ·{" "}
                          {[client.city, client.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost">
                      <Link href={`/clients/${client.id}`}>
                      Open chart
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Diagnosis
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {client.primaryDiagnosisCode ?? "Pending"}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Active cases
                      </p>
                      <p className="mt-2 font-semibold text-foreground">{activeCases}</p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Next session
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {nextSession ? formatDateTime(nextSession.scheduledStart) : "No upcoming visits"}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Open QA
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
                          Create first case
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
