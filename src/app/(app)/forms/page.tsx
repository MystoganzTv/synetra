import Link from "next/link";
import { ClipboardCheck, FileSignature, FolderSync, ShieldAlert } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getClients, getCases } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getDocuments, getFormPackets } from "@/lib/operations-data";
import { addDays, getNow } from "@/lib/time";

export default async function FormsPage() {
  const [forms, clients, cases, documents] = await Promise.all([
    getFormPackets(),
    getClients(),
    getCases(),
    getDocuments(),
  ]);

  const selectedPacket = forms[0];
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const caseMap = new Map(cases.map(({ caseRecord }) => [caseRecord.id, caseRecord]));
  const referenceDate = getNow();
  const weekEnd = addDays(referenceDate, 7);

  const dueThisWeek = forms.filter(
    (form) => new Date(form.dueDate) >= referenceDate && new Date(form.dueDate) <= weekEnd,
  ).length;
  const pendingSignatures = forms.filter(
    (form) => form.signatureStatus === "SENT" || form.signatureStatus === "PARTIAL",
  ).length;
  const completed = forms.filter((form) => form.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Intake & legal forms
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Intake and legal forms designed like a modern packet workspace
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Packet status, signature posture, and section-by-section form rendering all live in one workspace rather than being buried in a file cabinet flow.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Packets"
          value={String(forms.length)}
          hint="Open and completed packets represented in the tenant."
          icon={FolderSync}
        />
        <MetricCard
          title="Due This Week"
          value={String(dueThisWeek)}
          hint="Packets landing on the current operations horizon."
          icon={ShieldAlert}
        />
        <MetricCard
          title="Pending Signatures"
          value={String(pendingSignatures)}
          hint="Packets with one or more outstanding signatures."
          icon={FileSignature}
        />
        <MetricCard
          title="Completed"
          value={String(completed)}
          hint="Fully completed packets ready for archival or routing."
          icon={ClipboardCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Packet Queue</CardTitle>
            <CardDescription>
              Intake, consent, ROI, financial, and safety workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forms.map((form) => {
              const client = clientMap.get(form.clientId);
              const caseRecord = form.caseId ? caseMap.get(form.caseId) : null;
              const linkedDocs = documents.filter((document) => document.formPacketId === form.id);

              return (
                <div key={form.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{form.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {client ? `${client.firstName} ${client.lastName}` : form.clientId}
                      </p>
                    </div>
                    <StatusBadge value={form.status} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {form.packetType} · due {formatDate(form.dueDate)}
                      </span>
                      <span className="font-medium text-foreground">{form.completionPercent}%</span>
                    </div>
                    <Progress value={form.completionPercent} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[18px] bg-accent/45 p-3">
                      <p className="text-muted-foreground">Signature</p>
                      <p className="mt-1 font-medium text-foreground">{form.signatureStatus}</p>
                    </div>
                    <div className="rounded-[18px] bg-accent/45 p-3">
                      <p className="text-muted-foreground">Linked docs</p>
                      <p className="mt-1 font-medium text-foreground">{linkedDocs.length}</p>
                    </div>
                  </div>
                  {caseRecord ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {caseRecord.caseNumber} · {caseRecord.programName}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {selectedPacket ? (
          <Card className="bg-white/82">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>{selectedPacket.title}</CardTitle>
                  <CardDescription>
                    {selectedPacket.packetType} packet for{" "}
                    {clientMap.get(selectedPacket.clientId)?.firstName}{" "}
                    {clientMap.get(selectedPacket.clientId)?.lastName}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={selectedPacket.status} />
                  <StatusBadge value={selectedPacket.signatureStatus} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[24px] border border-border bg-accent/45 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Packet completion</p>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {selectedPacket.assignedTo} · due {formatDate(selectedPacket.dueDate)}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {selectedPacket.completionPercent}%
                  </p>
                </div>
                <div className="mt-4">
                  <Progress value={selectedPacket.completionPercent} />
                </div>
              </div>

              {selectedPacket.sections.map((section) => (
                <div key={section.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-foreground">{section.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="grid gap-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{field.label}</label>
                        {field.type === "textarea" ? (
                          <Textarea readOnly value={field.value ?? ""} className="min-h-24" />
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/75 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={field.checked ?? false}
                              readOnly
                              className="h-4 w-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm text-foreground">
                              {field.checked ? "Acknowledged" : "Not acknowledged"}
                            </span>
                          </div>
                        ) : (
                          <Input readOnly value={field.value ?? ""} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
