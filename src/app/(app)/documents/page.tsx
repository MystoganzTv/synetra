import Link from "next/link";
import { FileCheck2, FileWarning, FolderKanban, Signature } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients, getCases } from "@/lib/data";
import { formatDate, formatFileSize } from "@/lib/format";
import { getDocuments, getFormPackets, getGroups } from "@/lib/operations-data";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string }>;
}) {
  const query = await (
    searchParams ?? Promise.resolve({} as { created?: string })
  );
  const [documents, clients, cases, groups, forms] = await Promise.all([
    getDocuments(),
    getClients(),
    getCases(),
    getGroups(),
    getFormPackets(),
  ]);

  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const caseMap = new Map(cases.map(({ caseRecord }) => [caseRecord.id, caseRecord]));
  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const formMap = new Map(forms.map((form) => [form.id, form]));

  const expiring = documents.filter((document) => document.status === "EXPIRING").length;
  const pendingReview = documents.filter(
    (document) => document.status === "PENDING_REVIEW" || document.status === "DRAFT",
  ).length;
  const pendingSignature = documents.filter(
    (document) => document.requiresSignature && !document.signedAt,
  ).length;
  const wasCreated = query.created === "document";

  return (
    <div className="space-y-6">
      {wasCreated ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 text-sm text-emerald-700">
            Document uploaded successfully.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Documents
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Clinical, legal, and payer documents in one operating layer
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              A document center for treatment plans, assessments, releases, consents, and utilization packets, organized around clients, cases, groups, and form workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/documents/new">Upload document</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Documents"
          value={String(documents.length)}
          hint="Documents currently represented in the active workspace."
          icon={FolderKanban}
        />
        <MetricCard
          title="Expiring Soon"
          value={String(expiring)}
          hint="Items approaching renewal or re-signature."
          icon={FileWarning}
        />
        <MetricCard
          title="Pending Review"
          value={String(pendingReview)}
          hint="Draft or QA review items needing operational follow-up."
          icon={FileCheck2}
        />
        <MetricCard
          title="Unsigned Items"
          value={String(pendingSignature)}
          hint="Documents that still require one or more signatures."
          icon={Signature}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Document Center</CardTitle>
            <CardDescription>
              Files anchored to clients, cases, groups, and intake packets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.length > 0 ? documents.map((document) => {
              const client = document.clientId ? clientMap.get(document.clientId) : null;
              const caseRecord = document.caseId ? caseMap.get(document.caseId) : null;
              const group = document.groupId ? groupMap.get(document.groupId) : null;
              const form = document.formPacketId ? formMap.get(document.formPacketId) : null;

              return (
                <div key={document.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{document.title}</p>
                        <StatusBadge value={document.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {document.category} · owner {document.owner}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[22px] bg-accent/65 px-4 py-3 text-sm">
                      <p className="font-medium text-foreground">{document.source}</p>
                      <p className="text-muted-foreground">
                        Effective {formatDate(document.effectiveDate)}
                      </p>
                      {document.fileName ? (
                        <p className="mt-1 text-muted-foreground">
                          {document.fileName} · {formatFileSize(document.fileSizeBytes)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[20px] bg-accent/45 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Linked context
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {client ? `${client.firstName} ${client.lastName}` : "No client anchor"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {caseRecord?.caseNumber ?? group?.name ?? form?.title ?? "Standalone record"}
                      </p>
                    </div>
                    <div className="rounded-[20px] bg-accent/45 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Signature / expiration
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {document.requiresSignature
                          ? document.signedAt
                            ? `Signed ${formatDate(document.signedAt)}`
                            : "Signature still required"
                          : "No signature required"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {document.expiresAt ? `Expires ${formatDate(document.expiresAt)}` : "No expiration date"}
                      </p>
                    </div>
                  </div>
                  {document.fileName ? (
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/documents/${document.id}`}>Download file</a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            }) : (
              <div className="rounded-[24px] border border-dashed border-border bg-accent/35 p-5">
                <p className="text-lg font-semibold text-foreground">No documents uploaded yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload assessments, signed consents, IDs, or treatment plans to start building the client document center.
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/documents/new">Upload first document</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Operational Focus</CardTitle>
            <CardDescription>
              The document states that need attention first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents
              .filter(
                (document) =>
                  document.status === "EXPIRING" ||
                  document.status === "PENDING_REVIEW" ||
                  document.status === "DRAFT",
              )
              .map((document) => (
                <div key={document.id} className="rounded-[24px] border border-border bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{document.title}</p>
                    <StatusBadge value={document.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {document.owner} · {document.category}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {document.expiresAt
                      ? `Renew or review before ${formatDate(document.expiresAt)}.`
                      : "Document still needs operational review before it can be treated as current."}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
