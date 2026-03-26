import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthSession } from "@/lib/auth";
import { getCase, getCases, getClient, getClients } from "@/lib/data";
import { formatDateTimeLocalInput, taskPriorityOptions, taskStatusOptions, taskTypeOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") return "Select a client, add a title, and set a due date.";
  if (error === "unavailable") return "We could not save the task right now.";
  return null;
}

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams?: Promise<{ clientId?: string; caseId?: string; error?: string }>;
}) {
  const query = await (
    searchParams ?? Promise.resolve({} as { clientId?: string; caseId?: string; error?: string })
  );
  const [session, clients, cases, selectedClient, selectedCase] = await Promise.all([
    getAuthSession(),
    getClients(),
    getCases(),
    query.clientId ? getClient(query.clientId) : Promise.resolve(null),
    query.caseId ? getCase(query.caseId) : Promise.resolve(null),
  ]);

  if (query.clientId && !selectedClient) notFound();
  if (query.caseId && !selectedCase) notFound();

  const errorMessage = getErrorMessage(query.error);
  const defaultReturnTo = query.caseId
    ? `/cases/${query.caseId}`
    : query.clientId
      ? `/clients/${query.clientId}`
      : "/tasks";
  const defaultDueAt = new Date();
  defaultDueAt.setHours(defaultDueAt.getHours() + 24, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Task intake</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">New follow-up task</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Capture the next action so it stays visible on the TCM work queue instead of living only inside a note.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={defaultReturnTo}>Back</Link>
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-5 text-sm text-rose-700">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <Card className="bg-white/82">
        <CardHeader>
          <CardTitle>Task details</CardTitle>
          <CardDescription>Use tasks for outreach, document requests, auth follow-up, and next-step management.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/tasks" method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="clientId" className="text-sm font-medium text-foreground">Client</label>
                <select id="clientId" name="clientId" defaultValue={selectedClient?.id ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="caseId" className="text-sm font-medium text-foreground">Case</label>
                <select id="caseId" name="caseId" defaultValue={selectedCase?.caseRecord.id ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">
                  <option value="">Client-level task</option>
                  {cases.map(({ caseRecord, client }) => (
                    <option key={caseRecord.id} value={caseRecord.id}>
                      {caseRecord.caseNumber} · {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">Title</label>
                <Input id="title" name="title" placeholder="Call guardian to confirm school meeting time" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="taskType" className="text-sm font-medium text-foreground">Task type</label>
                <select id="taskType" name="taskType" defaultValue="FOLLOW_UP" className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">
                  {taskTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium text-foreground">Priority</label>
                <select id="priority" name="priority" defaultValue="MEDIUM" className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">
                  {taskPriorityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">Status</label>
                <select id="status" name="status" defaultValue="OPEN" className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">
                  {taskStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="dueAt" className="text-sm font-medium text-foreground">Due at</label>
                <Input id="dueAt" name="dueAt" type="datetime-local" defaultValue={formatDateTimeLocalInput(defaultDueAt)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
              <Textarea id="description" name="description" className="min-h-24" placeholder={`Owner: ${session?.name ?? "Current user"}\nWhat needs to happen, who is involved, and what would unblock the case.`} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">Save task</Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href={defaultReturnTo}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
