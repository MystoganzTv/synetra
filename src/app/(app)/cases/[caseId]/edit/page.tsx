import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { getCase } from "@/lib/data";
import { caseStatusOptions, formatDateInput } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") return "Complete program, payer, lead, location, and start date before saving.";
  if (error === "unavailable") return "We could not save the case right now.";
  return null;
}

export default async function EditCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const [{ caseId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);
  const caseContext = await getCase(caseId);

  if (!caseContext) notFound();

  const tcmUsers = process.env.DATABASE_URL
    ? await prisma.user.findMany({
        where: { role: "TCM", status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { email: true, name: true },
      })
    : [];
  const errorMessage = getErrorMessage(query.error);
  const { client, caseRecord } = caseContext;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Case edit</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit case</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Update the active case, close it cleanly, or transfer the client workspace to another TCM.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/cases/${caseRecord.id}`}>Back to case</Link>
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
          <CardTitle>Case details</CardTitle>
          <CardDescription>Edit the core episode, lifecycle state, and transfer ownership when needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={`/api/cases/${caseRecord.id}`} method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><label htmlFor="programName" className="text-sm font-medium text-foreground">Program name</label><Input id="programName" name="programName" defaultValue={caseRecord.programName} required /></div>
              <div className="space-y-2"><label htmlFor="payerName" className="text-sm font-medium text-foreground">Payer</label><Input id="payerName" name="payerName" defaultValue={caseRecord.payerName} required /></div>
              <div className="space-y-2"><label htmlFor="clinicalLead" className="text-sm font-medium text-foreground">Case lead</label><Input id="clinicalLead" name="clinicalLead" defaultValue={caseRecord.clinicalLead} required /></div>
              <div className="space-y-2"><label htmlFor="renderingProvider" className="text-sm font-medium text-foreground">Rendering provider</label><Input id="renderingProvider" name="renderingProvider" defaultValue={caseRecord.renderingProvider ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="location" className="text-sm font-medium text-foreground">Location</label><Input id="location" name="location" defaultValue={caseRecord.location} required /></div>
              <div className="space-y-2"><label htmlFor="status" className="text-sm font-medium text-foreground">Status</label><select id="status" name="status" defaultValue={caseRecord.status} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">{caseStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
              <div className="space-y-2"><label htmlFor="startDate" className="text-sm font-medium text-foreground">Start date</label><Input id="startDate" name="startDate" type="date" defaultValue={formatDateInput(caseRecord.startDate)} required /></div>
              <div className="space-y-2"><label htmlFor="endDate" className="text-sm font-medium text-foreground">End date</label><Input id="endDate" name="endDate" type="date" defaultValue={formatDateInput(caseRecord.endDate)} /></div>
              <div className="space-y-2"><label htmlFor="acuityLevel" className="text-sm font-medium text-foreground">Acuity / disposition</label><Input id="acuityLevel" name="acuityLevel" defaultValue={caseRecord.acuityLevel} /></div>
              <div className="space-y-2"><label htmlFor="transferOwnerEmail" className="text-sm font-medium text-foreground">Transfer TCM owner</label><select id="transferOwnerEmail" name="transferOwnerEmail" defaultValue={client.ownerEmail ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none"><option value="">Keep current owner</option>{tcmUsers.map((user) => <option key={user.email} value={user.email}>{user.name} · {user.email}</option>)}</select></div>
            </div>
            <div className="space-y-2">
              <label htmlFor="carePlanSummary" className="text-sm font-medium text-foreground">Care plan summary</label>
              <Textarea id="carePlanSummary" name="carePlanSummary" className="min-h-24" defaultValue={caseRecord.carePlanSummary ?? ""} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">Save case</Button>
              <Button type="button" asChild variant="outline" size="lg"><Link href={`/cases/${caseRecord.id}`}>Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
