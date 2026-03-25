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
    return "Completa programa, pagador, responsable, ubicacion y fecha de inicio.";
  }

  if (error === "unavailable") {
    return "No pudimos abrir el caso. Revisa la base de datos e intenta otra vez.";
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
          Apertura de caso
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Primer caso para {getClientDisplayName(client)}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Este paso crea el caso y su servicio base de coordinacion de cuidado para que puedas registrar actividades de inmediato.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}`}>Volver al cliente</Link>
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
          <CardTitle>Datos del caso</CardTitle>
          <CardDescription>
            Dejamos precargado el flujo TCM para que el caso nazca listo para seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/cases" method="post" className="space-y-6">
            <input type="hidden" name="clientId" value={client.id} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="programName" className="text-sm font-medium text-foreground">
                  Nombre del programa
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
                  Pagador
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
                  Responsable del caso
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
                  Ubicacion principal
                </label>
                <Input id="location" name="location" defaultValue={client.city ?? "Virtual"} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="caseType" className="text-sm font-medium text-foreground">
                  Tipo de caso
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
                  Estado inicial
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
                  Fecha de inicio
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
                  Nivel de acuidad
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
                Resumen del plan
              </label>
              <Textarea
                id="carePlanSummary"
                name="carePlanSummary"
                className="min-h-24"
                placeholder="Barreras actuales, metas del caso, stakeholders y primer enfoque del TCM."
              />
            </div>

            <div className="rounded-[24px] border border-border bg-accent/40 p-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Servicio base del caso</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Creamos el primer servicio dentro del mismo paso para que no tengas que pasar por otra pantalla antes de documentar actividad.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="serviceCode" className="text-sm font-medium text-foreground">
                    Codigo del servicio
                  </label>
                  <Input id="serviceCode" name="serviceCode" defaultValue="TCM-001" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceTitle" className="text-sm font-medium text-foreground">
                    Titulo del servicio
                  </label>
                  <Input id="serviceTitle" name="serviceTitle" defaultValue="Coordinacion de cuidado" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceFrequency" className="text-sm font-medium text-foreground">
                    Frecuencia
                  </label>
                  <Input id="serviceFrequency" name="serviceFrequency" defaultValue="Seguimiento semanal" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="unitType" className="text-sm font-medium text-foreground">
                    Unidad
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
                    Unidades por actividad
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
                    Tarifa en centavos
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
                <h2 className="text-lg font-semibold text-foreground">Autorizacion inicial opcional</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Si ya tienes autorizacion, capturala ahora. Si no, el caso igual se abre y puedes documentar seguimiento.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    Numero de autorizacion
                  </label>
                  <Input id="authorizationNumber" name="authorizationNumber" placeholder="AUTH-12345" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="approvedUnits" className="text-sm font-medium text-foreground">
                    Unidades aprobadas
                  </label>
                  <Input id="approvedUnits" name="approvedUnits" type="number" min="1" placeholder="24" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationStartDate"
                    className="text-sm font-medium text-foreground"
                  >
                    Inicio autorizacion
                  </label>
                  <Input id="authorizationStartDate" name="authorizationStartDate" type="date" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="authorizationEndDate"
                    className="text-sm font-medium text-foreground"
                  >
                    Fin autorizacion
                  </label>
                  <Input id="authorizationEndDate" name="authorizationEndDate" type="date" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Crear caso
              </Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href={`/clients/${client.id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
