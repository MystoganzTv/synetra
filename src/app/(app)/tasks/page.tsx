import Link from "next/link";
import { CheckCircle2, CircleAlert, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { requireAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getNow } from "@/lib/time";

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; updated?: string }>;
}) {
  const session = await requireAuthSession();
  const query = await (searchParams ?? Promise.resolve({} as { created?: string; updated?: string }));
  const isElevated = session.role === "Platform Admin" || session.role === "Revenue Operations";

  const tasks = process.env.DATABASE_URL
    ? await prisma.tcmTask.findMany({
        where: isElevated ? undefined : { ownerEmail: session.email.toLowerCase() },
        include: {
          client: { select: { id: true, firstName: true, lastName: true } },
          case: { select: { id: true, caseNumber: true, programName: true } },
        },
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
      })
    : [];
  const now = getNow().getTime();

  const openCount = tasks.filter((task) => task.status === "OPEN").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const overdueCount = tasks.filter(
    (task) => task.status !== "DONE" && new Date(task.dueAt).getTime() < now,
  ).length;

  return (
    <div className="space-y-6">
      {(query.created === "task" || query.updated === "task") ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 text-sm text-emerald-700">
            Task queue updated successfully.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tasks</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Follow-up queue</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              A working list for outreach, document requests, auth follow-up, and next-step management across the caseload.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tasks/new">
                New task
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
        <MetricCard title="Open" value={String(openCount)} hint="Tasks waiting to be worked." icon={CircleAlert} />
        <MetricCard title="In progress" value={String(inProgressCount)} hint="Tasks actively being worked." icon={Plus} />
        <MetricCard title="Overdue" value={String(overdueCount)} hint="Tasks due in the past and still unresolved." icon={CheckCircle2} />
      </div>

      <Card className="bg-white/82">
        <CardHeader>
          <CardTitle>Task board</CardTitle>
          <CardDescription>Keep the next action visible so nothing lives only inside a note.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length ? (
            tasks.map((task) => (
              <div key={task.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{task.title}</p>
                      <StatusBadge value={task.status} />
                      <StatusBadge value={task.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.taskType} · due {formatDateTime(task.dueAt)}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {task.description || "No description added yet."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {task.client.firstName} {task.client.lastName}
                      {task.case ? ` · ${task.case.caseNumber} · ${task.case.programName}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/clients/${task.client.id}`}>Open client</Link>
                    </Button>
                    <form action={`/api/tasks/${task.id}`} method="post">
                      <input type="hidden" name="intent" value={task.status === "DONE" ? "reopen" : "complete"} />
                      <Button type="submit" size="sm">
                        {task.status === "DONE" ? "Reopen" : "Mark done"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-accent/35 p-5">
              <p className="text-lg font-semibold text-foreground">No tasks yet</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start by creating a follow-up task for a client or case so next actions stay visible on the queue.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/tasks/new">Create first task</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
