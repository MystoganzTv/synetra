import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthSession } from "@/lib/auth";
import { getSession } from "@/lib/data";
import { getClientDisplayName } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { noteStatusOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Complete all four sections of the note before saving documentation.";
  }

  if (error === "unavailable") {
    return "We could not save the note right now.";
  }

  return null;
}

export default async function NewProgressNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const [{ sessionId }, authSession, query] = await Promise.all([
    params,
    getAuthSession(),
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);
  const record = await getSession(sessionId);

  if (!record) {
    notFound();
  }

  const errorMessage = getErrorMessage(query.error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          New note
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Note for {getClientDisplayName(record.client)}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {formatDateTime(record.session.scheduledStart)} ·{" "}
              {record.service
                ? `${record.service.serviceCode} ${record.service.title}`
                : "Activity without service"}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/sessions/${record.session.id}`}>Back to activity</Link>
          </Button>
        </div>
      </div>

      {record.session.progressNotes.length > 0 ? (
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>This activity already has a note</CardTitle>
            <CardDescription>
              For now, we keep one primary note per activity to keep the workflow clear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/sessions/${record.session.id}`}>Back to activity</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Clinical documentation</CardTitle>
            <CardDescription>
              Use this note to close out TCM follow-up, outreach, school coordination, or a care conference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage ? (
              <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <form action="/api/progress-notes" method="post" className="space-y-6">
              <input type="hidden" name="sessionId" value={record.session.id} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="authorName" className="text-sm font-medium text-foreground">
                    Author
                  </label>
                  <Input
                    id="authorName"
                    name="authorName"
                    defaultValue={authSession?.name ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-foreground">
                    Note status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="DRAFT"
                    className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    {noteStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="subjective" className="text-sm font-medium text-foreground">
                    Subjective
                  </label>
                  <Textarea
                    id="subjective"
                    name="subjective"
                    placeholder="Who participated, what need was reported, and why follow-up was needed."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="objective" className="text-sm font-medium text-foreground">
                    Objective
                  </label>
                  <Textarea
                    id="objective"
                    name="objective"
                    placeholder="Actions completed, outreach, coordination, confirmations, or barriers observed."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="assessment" className="text-sm font-medium text-foreground">
                    Assessment
                  </label>
                  <Textarea
                    id="assessment"
                    name="assessment"
                    placeholder="Impact of the contact, progress, risk level, and whether the case needs escalation."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="plan" className="text-sm font-medium text-foreground">
                    Plan
                  </label>
                  <Textarea
                    id="plan"
                    name="plan"
                    placeholder="Next step, follow-up date, owners, and pending action."
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-[18px] border border-border bg-accent/35 px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="incidentReported"
                  className="h-4 w-4 rounded border-border"
                />
                Mark this if there was an incident or situation that should be escalated to compliance.
              </label>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg">
                  Save note
                </Button>
                <Button type="button" asChild variant="outline" size="lg">
                  <Link href={`/sessions/${record.session.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
