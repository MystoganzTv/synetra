import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { SessionBillingStatusBadge } from "@/components/session-billing-status-badge";
import { SessionValidationStatusBadge } from "@/components/session-validation-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/data";
import { getClientDisplayName, getSessionEmployeeName, getSessionEmployeeTitle } from "@/lib/domain";
import { formatDate, formatDateTime, formatPercent } from "@/lib/format";
import { validateSession } from "@/lib/session-validation";

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{ created?: string; error?: string }>;
}) {
  const [{ sessionId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { created?: string; error?: string }),
  ]);
  const record = await getSession(sessionId);

  if (!record) {
    notFound();
  }

  const { client, caseRecord, service, authorization, session } = record;
  const validation = validateSession(record);
  const wasCreated = query.created === "session";
  const noteCreated = query.created === "note";
  const noteExistsError = query.error === "note_exists";

  return (
    <div className="space-y-6">
      {wasCreated ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-emerald-700">
              Activity created. The recommended next step is documenting the note.
            </p>
            <Button asChild size="sm">
              <Link href={`/sessions/${session.id}/notes/new`}>Add note</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {noteCreated ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 text-sm text-emerald-700">
            Note saved successfully.
          </CardContent>
        </Card>
      ) : null}
      {noteExistsError ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-700">
            This activity already has a primary note attached.
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden bg-white/86">
        <CardContent className="grid gap-6 px-6 py-7 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Session detail
              </p>
              <StatusBadge value={session.attendanceStatus} />
              <SessionBillingStatusBadge status={validation.billingStatus} />
              <SessionValidationStatusBadge status={validation.validationStatus} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {getClientDisplayName(client)}
              </h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {formatDateTime(session.scheduledStart)} · {service ? `${service.serviceCode} ${service.title}` : "Unlinked service"}
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              This validation flow confirms the session is properly linked to client, case,
              service, authorization, and employee before it moves into billing readiness.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/cases/${caseRecord.id}`}>Back to case</Link>
              </Button>
              <Button asChild>
                <Link href={`/sessions/${session.id}/notes/new`}>Add note</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/clients/${client.id}`}>Open client</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Employee
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {getSessionEmployeeName(session)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{getSessionEmployeeTitle(session)}</p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Authorization window
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {authorization
                  ? `${formatDate(authorization.startDate)} to ${formatDate(authorization.endDate)}`
                  : "No linked authorization"}
              </p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Units
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {validation.unitsNeeded} needed · {validation.unitsRemaining} remaining
              </p>
            </div>
            <div className="rounded-[24px] bg-accent/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Progress note
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {validation.progressNoteCompleted ? "Completed" : "Incomplete"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/82">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Readiness score</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatPercent(validation.readinessScore)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/82">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Authorization active</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {validation.authorizationActive ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/82">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Within range</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {validation.sessionWithinAuthorizationRange ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/82">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Units available</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {validation.unitsAvailable ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Validation checks</CardTitle>
            <CardDescription>
              Business rules required to safely move this session into billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.checks.map((check) => (
              <div key={check.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        check.status === "pass"
                          ? "bg-emerald-500"
                          : check.status === "warning"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{check.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                  {check.status === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <CircleAlert
                      className={`h-5 w-5 ${
                        check.status === "warning" ? "text-amber-600" : "text-rose-600"
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Billing flow outcome</CardTitle>
              <CardDescription>
                This session is evaluated against authorization, units, documentation, and attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-border bg-white/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SessionBillingStatusBadge status={validation.billingStatus} />
                  <SessionValidationStatusBadge status={validation.validationStatus} />
                </div>
                <div className="mt-4">
                  <Progress value={validation.readinessScore} />
                </div>
                {validation.hardFails.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                      Hard fails
                    </p>
                    <div className="mt-2 space-y-2">
                      {validation.hardFails.map((failure) => (
                        <p key={failure} className="text-sm text-rose-700">
                          {failure}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
                {validation.softFails.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Soft fails
                    </p>
                    <div className="mt-2 space-y-2">
                      {validation.softFails.map((failure) => (
                        <p key={failure} className="text-sm text-amber-700">
                          {failure}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Linked entities</CardTitle>
              <CardDescription>
                Each session must be anchored to the operational hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[20px] bg-accent/50 p-4">
                <p className="text-sm font-medium text-foreground">{getClientDisplayName(client)}</p>
                <p className="text-sm text-muted-foreground">Client</p>
              </div>
              <div className="rounded-[20px] bg-accent/50 p-4">
                <p className="text-sm font-medium text-foreground">{caseRecord.programName}</p>
                <p className="text-sm text-muted-foreground">Case · {caseRecord.caseNumber}</p>
              </div>
              <div className="rounded-[20px] bg-accent/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  {service ? `${service.serviceCode} · ${service.title}` : "No linked service"}
                </p>
                <p className="text-sm text-muted-foreground">Service</p>
              </div>
              <div className="rounded-[20px] bg-accent/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  {authorization?.authorizationNumber ?? "No linked authorization"}
                </p>
                <p className="text-sm text-muted-foreground">Authorization</p>
              </div>
              <div className="rounded-[20px] bg-accent/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  {getSessionEmployeeName(session)}
                </p>
                <p className="text-sm text-muted-foreground">Employee</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Progress note</CardTitle>
              <CardDescription>
                A session can be opened quickly and then closed with a structured note.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.progressNotes.length > 0 ? (
                session.progressNotes.map((progressNote) => (
                  <div key={progressNote.id} className="rounded-[20px] bg-accent/45 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{progressNote.authorName}</p>
                      <StatusBadge value={progressNote.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {progressNote.assessment}
                    </p>
                    {progressNote.contactType || progressNote.participants || progressNote.followUpAt ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-[18px] bg-white/70 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contact type</p>
                          <p className="mt-1 text-sm text-foreground">{progressNote.contactType ?? "Not captured"}</p>
                        </div>
                        <div className="rounded-[18px] bg-white/70 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Participants</p>
                          <p className="mt-1 text-sm text-foreground">{progressNote.participants ?? "Not captured"}</p>
                        </div>
                        <div className="rounded-[18px] bg-white/70 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Follow-up due</p>
                          <p className="mt-1 text-sm text-foreground">{progressNote.followUpAt ? formatDateTime(progressNote.followUpAt) : "Not set"}</p>
                        </div>
                      </div>
                    ) : null}
                    {progressNote.barriers ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        <span className="font-medium text-foreground">Barriers:</span> {progressNote.barriers}
                      </p>
                    ) : null}
                    {progressNote.interventions ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        <span className="font-medium text-foreground">Interventions:</span> {progressNote.interventions}
                      </p>
                    ) : null}
                    {progressNote.nextStep ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        <span className="font-medium text-foreground">Next step:</span> {progressNote.nextStep}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-border bg-white/70 p-4">
                  <p className="font-medium text-foreground">No note yet</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Create the note now to fully document the activity.
                  </p>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href={`/sessions/${session.id}/notes/new`}>Create note</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
