import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getClient } from "@/lib/data";
import { clientStatusOptions, formatDateInput, riskLevelOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") return "Complete first name, last name, and date of birth before saving.";
  if (error === "unavailable") return "We could not save the client right now.";
  return null;
}

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const [{ clientId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);
  const client = await getClient(clientId);

  if (!client) notFound();

  const errorMessage = getErrorMessage(query.error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Client edit</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit client</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Update demographics, payer, referral source, and risk so the chart stays usable over time.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}`}>Back to client</Link>
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
          <CardTitle>Client details</CardTitle>
          <CardDescription>Keep the chart current as contact, diagnosis, or payer details change.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={`/api/clients/${client.id}`} method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><label htmlFor="firstName" className="text-sm font-medium text-foreground">First name</label><Input id="firstName" name="firstName" defaultValue={client.firstName} required /></div>
              <div className="space-y-2"><label htmlFor="lastName" className="text-sm font-medium text-foreground">Last name</label><Input id="lastName" name="lastName" defaultValue={client.lastName} required /></div>
              <div className="space-y-2"><label htmlFor="preferredName" className="text-sm font-medium text-foreground">Preferred name</label><Input id="preferredName" name="preferredName" defaultValue={client.preferredName ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">Date of birth</label><Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={formatDateInput(client.dateOfBirth)} required /></div>
              <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium text-foreground">Email</label><Input id="email" name="email" type="email" defaultValue={client.email ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</label><Input id="phone" name="phone" defaultValue={client.phone ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="city" className="text-sm font-medium text-foreground">City</label><Input id="city" name="city" defaultValue={client.city ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="state" className="text-sm font-medium text-foreground">State</label><Input id="state" name="state" defaultValue={client.state ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="primaryDiagnosisCode" className="text-sm font-medium text-foreground">Primary diagnosis</label><Input id="primaryDiagnosisCode" name="primaryDiagnosisCode" defaultValue={client.primaryDiagnosisCode ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="payerSegment" className="text-sm font-medium text-foreground">Payer</label><Input id="payerSegment" name="payerSegment" defaultValue={client.payerSegment ?? ""} /></div>
              <div className="space-y-2"><label htmlFor="status" className="text-sm font-medium text-foreground">Status</label><select id="status" name="status" defaultValue={client.status} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">{clientStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
              <div className="space-y-2"><label htmlFor="riskLevel" className="text-sm font-medium text-foreground">Risk</label><select id="riskLevel" name="riskLevel" defaultValue={client.riskLevel} className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none">{riskLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
            </div>
            <div className="space-y-2">
              <label htmlFor="referralSource" className="text-sm font-medium text-foreground">Referral source</label>
              <Textarea id="referralSource" name="referralSource" className="min-h-24" defaultValue={client.referralSource ?? ""} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">Save client</Button>
              <Button type="button" asChild variant="outline" size="lg"><Link href={`/clients/${client.id}`}>Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
