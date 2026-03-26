import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthSession } from "@/lib/auth";
import { getClient } from "@/lib/data";
import {
  caseStatusOptions,
  caseTypeOptions,
  formatDateInput,
  unitTypeOptions,
} from "@/lib/ops-create";
import { getClientDisplayName } from "@/lib/domain";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Complete program, payer, owner, location, and start date.";
  }

  if (error === "unavailable") {
    return "We could not create the case right now. Check the database and try again.";
  }

  return null;
}

export default async function NewCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const [{ clientId }, session, query] = await Promise.all([
    params,
    getAuthSession(),
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);
  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  const errorMessage = getErrorMessage(query.error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Case intake
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              First case for {getClientDisplayName(client)}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              This step creates the case and its base care coordination service so you can start documenting activity right away.
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
          <CardTitle>Case details</CardTitle>
          <CardDescription>
            The TCM flow is prefilled so the case is ready for follow-up from the start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/cases" method="post" className="space-y-6">
            <input type="hidden" name="clientId" value={client.id} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="programName" className="text-sm font-medium text-foreground">
                  Program name
                </label>
                <Input
                  id="programName"
                  name="programName"
                  defaultValue="Care Coordination"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="payerName" className="text-sm font-medium text-foreground">
                  Payer
                </label>
                <Input
                  id="payerName"
                  name="payerName"
                  defaultValue={client.payerSegment ?? ""}
                  placeholder="Florida Medicaid"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="clinicalLead" className="text-sm font-medium text-foreground">
                  Case owner
                </label>
                <Input
                  id="clinicalLead"
                  name="clinicalLead"
                  defaultValue={session?.name ?? ""}
                  placeholder="Enrique Padron"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-foreground">
                  Primary location
                </label>
                <Input id="location" name="location" defaultValue={client.city ?? "Virtual"} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="caseType" className="text-sm font-medium text-foreground">
                  Case type
                </label>
                <select
                  id="caseType"
                  name="caseType"
                  defaultValue="CARE_COORDINATION"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {caseTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Initial status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="ACTIVE"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {caseStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  Start date
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={formatDateInput(new Date())}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="acuityLevel" className="text-sm font-medium text-foreground">
                  Acuity level
                </label>
                <Input id="acuityLevel" name="acuityLevel" defaultValue="Routine" />
              </div>
              <div className="space-y-2">
                <label htmlFor="renderingProvider" className="text-sm font-medium text-foreground">
                  Rendering provider
                </label>
                <Input id="renderingProvider" name="renderingProvider" placeholder="Synetra TCM Team" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="carePlanSummary" className="text-sm font-medium text-foreground">
                Plan summary
              </label>
              <Textarea
                id="carePlanSummary"
                name="carePlanSummary"
                className="min-h-24"
                placeholder="Current barriers, case goals, stakeholders, and the first TCM focus."
              />
            </div>

            <div className="rounded-[24px] border border-border bg-accent/40 p-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Base service</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  We create the first service in the same step so you do not need another screen before documenting activity.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="serviceCode" className="text-sm font-medium text-foreground">
                    Service code
                  </label>
                  <Input id="serviceCode" name="serviceCode" defaultValue="TCM-001" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceTitle" className="text-sm font-medium text-foreground">
                    Service title
                  </label>
                  <Input id="serviceTitle" name="serviceTitle" defaultValue="Care coordination" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceFrequency" className="text-sm font-medium text-foreground">
                    Frequency
                  </label>
                  <Input id="serviceFrequency" name="serviceFrequency" defaultValue="Weekly follow-up" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="unitType" className="text-sm font-medium text-foreground">
                    Unit type
                  </label>
                  <select
                    id="unitType"
                    name="unitType"
                    defaultValue="HOURS"
                    className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    {unitTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="defaultUnitsPerSession"
                    className="text-sm font-medium text-foreground"
                  >
                    Units per activity
                  </label>
                  <Input
                    id="defaultUnitsPerSession"
                    name="defaultUnitsPerSession"
                    type="number"
                    defaultValue="1"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="defaultRateCents" className="text-sm font-medium text-foreground">
                    Rate in cents
                  </label>
                  <Input
                    id="defaultRateCents"
                    name="defaultRateCents"
                    type="number"
                    defaultValue="13500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-border bg-white/70 p-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Optional initial authorization</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  If you already have authorization, capture it now. If not, the case still opens and you can begin documenting follow-up.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    Authorization number
                  </label>
                  <Input id="authorizationNumber" name="authorizationNumber" placeholder="AUTH-12345" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="approvedUnits" className="text-sm font-medium text-foreground">
                    Approved units
                  </label>
                  <Input id="approvedUnits" name="approvedUnits" type="number" min="1" placeholder="24" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationStartDate"
                    className="text-sm font-medium text-foreground"
                  >
                    Authorization start
                  </label>
                  <Input id="authorizationStartDate" name="authorizationStartDate" type="date" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationEndDate"
                    className="text-sm font-medium text-foreground"
                  >
                    Authorization end
                  </label>
                  <Input id="authorizationEndDate" name="authorizationEndDate" type="date" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Create case
              </Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href={`/clients/${client.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
