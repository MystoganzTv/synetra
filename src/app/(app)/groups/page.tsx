import Link from "next/link";
import { CalendarClock, FileStack, Users, Waves } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getClients } from "@/lib/data";
import { getGroupNextSession, getGroupUtilization } from "@/lib/domain";
import { formatDateTime, formatPercent } from "@/lib/format";
import { getDocuments, getGroups } from "@/lib/operations-data";
import { getNow } from "@/lib/time";

export default async function GroupsPage() {
  const [groups, clients, documents] = await Promise.all([
    getGroups(),
    getClients(),
    getDocuments(),
  ]);
  const referenceDate = getNow();

  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const activeGroups = groups.filter((group) => group.status === "ACTIVE").length;
  const seatsUsed = groups.reduce(
    (sum, group) =>
      sum + group.memberships.filter((membership) => membership.status === "ACTIVE").length,
    0,
  );
  const upcomingSessions = groups.flatMap((group) =>
    group.sessions.filter((session) => new Date(session.scheduledStart) >= referenceDate),
  ).length;
  const averageDocumentation =
    groups.reduce((sum, group) => {
      const completedSessions = group.sessions.filter((session) => session.status === "COMPLETED");
      if (!completedSessions.length) return sum;

      return (
        sum +
        completedSessions.reduce(
          (sessionTotal, session) => sessionTotal + session.noteCompletionPercent,
          0,
        ) /
          completedSessions.length
      );
    }, 0) / Math.max(groups.length, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Groups
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Group programs, facilitators, and attendance health
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Group operations tied back to care delivery, capacity, documentation follow-through, and the shared paperwork that keeps cohorts compliant.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Groups"
          value={String(activeGroups)}
          hint="Current cohorts in delivery or active planning."
          icon={Users}
        />
        <MetricCard
          title="Occupied Seats"
          value={String(seatsUsed)}
          hint="Active memberships across all groups."
          icon={Waves}
        />
        <MetricCard
          title="Upcoming Sessions"
          value={String(upcomingSessions)}
          hint="Scheduled group encounters on the near-term calendar."
          icon={CalendarClock}
        />
        <MetricCard
          title="Avg Note Completion"
          value={formatPercent(averageDocumentation)}
          hint="Average completion rate across completed group sessions."
          icon={FileStack}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {groups.map((group) => {
            const nextSession = getGroupNextSession(group, referenceDate);
            const utilization = getGroupUtilization(group);
            const relatedDocuments = documents.filter((document) => document.groupId === group.id);

            return (
              <Card key={group.id} className="bg-white/82">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">{group.name}</h2>
                        <StatusBadge value={group.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.track} · {group.serviceLine}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {group.clinicalFocus}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/60 px-4 py-3 text-sm">
                      <p className="font-medium text-foreground">{group.facilitatorName}</p>
                      <p className="text-muted-foreground">
                        {group.coFacilitatorName ?? "Single facilitator"} · {group.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Next session
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {nextSession ? formatDateTime(nextSession.scheduledStart) : "Not scheduled"}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Schedule pattern
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {group.schedulePattern}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-accent/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Group documents
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {relatedDocuments.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacity utilization</span>
                      <span className="font-medium text-foreground">
                        {formatPercent(utilization)}
                      </span>
                    </div>
                    <Progress value={utilization} />
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    {group.memberships.map((membership) => {
                      const client = clientMap.get(membership.clientId);

                      return (
                        <div key={membership.id} className="rounded-[22px] border border-border bg-white/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {client ? `${client.firstName} ${client.lastName}` : membership.clientId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Attendance {membership.attendanceRate}%
                              </p>
                            </div>
                            <StatusBadge value={membership.status} />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {membership.participationGoal}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Session Readiness</CardTitle>
            <CardDescription>
              Upcoming and recently completed group sessions with documentation posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.flatMap((group) =>
              group.sessions
                .sort(
                  (left, right) =>
                    new Date(left.scheduledStart).getTime() -
                    new Date(right.scheduledStart).getTime(),
                )
                .map((session) => (
                  <div key={session.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(session.scheduledStart)}
                        </p>
                      </div>
                      <StatusBadge value={session.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Attendance</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {session.attendanceCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Notes due</p>
                        <p className="mt-1 font-semibold text-foreground">{session.notesDue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {session.noteCompletionPercent}%
                        </p>
                      </div>
                    </div>
                  </div>
                )),
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
