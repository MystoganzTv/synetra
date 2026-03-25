import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clientStatusOptions, riskLevelOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Completa nombre, apellido y fecha de nacimiento para abrir el expediente.";
  }

  if (error === "unavailable") {
    return "No pudimos guardar el cliente ahora mismo. Revisa la base de datos e intenta otra vez.";
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
          Alta operativa
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Nuevo cliente
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Crea el expediente base y luego continua de inmediato con el primer caso, actividad y nota.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/clients">Volver a clientes</Link>
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
          <CardTitle>Datos base del cliente</CardTitle>
          <CardDescription>
            Mantuvimos este primer paso corto para que puedas abrir casos rapido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/clients" method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  Nombre
                </label>
                <Input id="firstName" name="firstName" placeholder="Enrique" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Apellido
                </label>
                <Input id="lastName" name="lastName" placeholder="Padron" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="preferredName" className="text-sm font-medium text-foreground">
                  Nombre preferido
                </label>
                <Input id="preferredName" name="preferredName" placeholder="Quique" />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                  Fecha de nacimiento
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
                  Telefono
                </label>
                <Input id="phone" name="phone" placeholder="(305) 555-0142" />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-foreground">
                  Ciudad
                </label>
                <Input id="city" name="city" placeholder="Miami" />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium text-foreground">
                  Estado
                </label>
                <Input id="state" name="state" placeholder="FL" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="primaryDiagnosisCode"
                  className="text-sm font-medium text-foreground"
                >
                  Diagnostico principal
                </label>
                <Input id="primaryDiagnosisCode" name="primaryDiagnosisCode" placeholder="F84.0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="payerSegment" className="text-sm font-medium text-foreground">
                  Pagador
                </label>
                <Input id="payerSegment" name="payerSegment" placeholder="Sunshine Health" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Estado inicial
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
                  Riesgo
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
                Fuente de referido
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
                Guardar cliente
              </Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href="/clients">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
