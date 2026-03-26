import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCase, getCases, getClient, getClients } from "@/lib/data";
import {
  documentCategoryOptions,
  documentStatusOptions,
  formatDateInput,
} from "@/lib/ops-create";
import { formatEnumLabel } from "@/lib/format";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Select a client, add a title, and attach a file before uploading.";
  }

  if (error === "file_too_large") {
    return "Files must stay under 5 MB for this first upload workflow.";
  }

  if (error === "file_type") {
    return "Only PDF, Word, JPG, PNG, and WEBP files are supported right now.";
  }

  if (error === "unavailable") {
    return "We could not store this document right now. Please try again.";
  }

  return null;
}

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams?: Promise<{
    clientId?: string;
    caseId?: string;
    error?: string;
  }>;
}) {
  const query = await (
    searchParams ??
    Promise.resolve({} as { clientId?: string; caseId?: string; error?: string })
  );

  const [clients, cases, selectedClient, selectedCase] = await Promise.all([
    getClients(),
    getCases(),
    query.clientId ? getClient(query.clientId) : Promise.resolve(null),
    query.caseId ? getCase(query.caseId) : Promise.resolve(null),
  ]);

  if (query.clientId && !selectedClient) {
    notFound();
  }

  if (query.caseId && !selectedCase) {
    notFound();
  }

  const errorMessage = getErrorMessage(query.error);
  const today = formatDateInput(new Date());
  const defaultReturnTo = query.caseId
    ? `/cases/${query.caseId}`
    : query.clientId
      ? `/clients/${query.clientId}`
      : "/documents";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Document upload
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Upload a client document
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Attach signed consents, assessments, treatment plans, IDs, or payer paperwork directly to the client and optionally to a specific case.
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
          <CardTitle>Document details</CardTitle>
          <CardDescription>
            This first version stores the uploaded file securely in the workspace database and keeps it linked to the client record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/api/documents"
            method="post"
            encType="multipart/form-data"
            className="space-y-6"
          >
            <input type="hidden" name="returnTo" value={defaultReturnTo} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="clientId" className="text-sm font-medium text-foreground">
                  Client
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  defaultValue={selectedClient?.id ?? ""}
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="caseId" className="text-sm font-medium text-foreground">
                  Case
                </label>
                <select
                  id="caseId"
                  name="caseId"
                  defaultValue={selectedCase?.caseRecord.id ?? ""}
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="">Client-level only</option>
                  {cases.map(({ caseRecord, client }) => (
                    <option key={caseRecord.id} value={caseRecord.id}>
                      {caseRecord.caseNumber} · {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title
                </label>
                <Input id="title" name="title" placeholder="Signed ROI - March 2026" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="file" className="text-sm font-medium text-foreground">
                  File
                </label>
                <Input id="file" name="file" type="file" required />
                <p className="text-xs text-muted-foreground">
                  PDF, Word, JPG, PNG, or WEBP up to 5 MB.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue="CLINICAL"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {documentCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="CURRENT"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {documentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="effectiveDate" className="text-sm font-medium text-foreground">
                  Effective date
                </label>
                <Input id="effectiveDate" name="effectiveDate" type="date" defaultValue={today} />
              </div>
              <div className="space-y-2">
                <label htmlFor="expiresAt" className="text-sm font-medium text-foreground">
                  Expiration date
                </label>
                <Input id="expiresAt" name="expiresAt" type="date" />
              </div>
              <div className="space-y-2">
                <label htmlFor="source" className="text-sm font-medium text-foreground">
                  Source
                </label>
                <Input id="source" name="source" defaultValue="Client upload" />
              </div>
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium text-foreground">
                  Tags
                </label>
                <Input id="tags" name="tags" placeholder="roi, intake, signed" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Internal context
              </label>
              <Textarea
                id="notes"
                name="notes"
                className="min-h-24"
                placeholder="Optional context for the upload. Use tags for structured filtering."
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Notes are coming next. This first pass focuses on secure upload and retrieval.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-[18px] border border-border bg-accent/35 px-4 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                name="requiresSignature"
                className="h-4 w-4 rounded border-border"
              />
              This document still requires one or more signatures.
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Upload document
              </Button>
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
