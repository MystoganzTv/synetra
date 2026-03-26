import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clientStatusOptions, riskLevelOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Complete first name, last name, and date of birth to open the chart.";
  }

  if (error === "unavailable") {
    return "We could not save the client right now. Check the database and try again.";
  }

  return null;
}

export default async function NewClientPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await (
    searchParams ?? Promise.resolve({} as { error?: string })
  );
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Client intake
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              New client
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Create the base chart and then continue immediately with the first case, activity, and note.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/clients">Back to clients</Link>
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
          <CardTitle>Core client details</CardTitle>
          <CardDescription>
            This first step stays short so you can open the case quickly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/clients" method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First name
                </label>
                <Input id="firstName" name="firstName" placeholder="Enrique" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last name
                </label>
                <Input id="lastName" name="lastName" placeholder="Padron" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="preferredName" className="text-sm font-medium text-foreground">
                  Preferred name
                </label>
                <Input id="preferredName" name="preferredName" placeholder="Quique" />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                  Date of birth
                </label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone
                </label>
                <Input id="phone" name="phone" placeholder="(305) 555-0142" />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-foreground">
                  City
                </label>
                <Input id="city" name="city" placeholder="Miami" />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium text-foreground">
                  State
                </label>
                <Input id="state" name="state" placeholder="FL" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="primaryDiagnosisCode"
                  className="text-sm font-medium text-foreground"
                >
                  Primary diagnosis
                </label>
                <Input id="primaryDiagnosisCode" name="primaryDiagnosisCode" placeholder="F84.0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="payerSegment" className="text-sm font-medium text-foreground">
                  Payer
                </label>
                <Input id="payerSegment" name="payerSegment" placeholder="Sunshine Health" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Initial status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="INTAKE"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {clientStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="riskLevel" className="text-sm font-medium text-foreground">
                  Risk
                </label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  defaultValue="LOW"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {riskLevelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="referralSource" className="text-sm font-medium text-foreground">
                Referral source
              </label>
              <Textarea
                id="referralSource"
                name="referralSource"
                className="min-h-24"
                placeholder="Hospital discharge, school counselor, pediatrician, self-referral..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Save client
              </Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href="/clients">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
