import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCase } from "@/lib/data";
import { getClientDisplayName } from "@/lib/domain";
import { formatDateTimeLocalInput, sessionStatusOptions } from "@/lib/ops-create";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Selecciona un servicio y completa fecha, ubicacion y estado de la actividad.";
  }

  if (error === "unavailable") {
    return "No pudimos guardar la actividad ahora mismo.";
  }

  return null;
}

export default async function NewSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const [{ caseId }, session, query] = await Promise.all([
    params,
    getAuthSession(),
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);
  const record = await getCase(caseId);

  if (!record) {
    notFound();
  }

  const activeEmployees = process.env.DATABASE_URL
    ? await prisma.employee.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, displayName: true, email: true, title: true },
      })
    : [];
  const currentEmployee =
    activeEmployees.find(
      (employee) => employee.email?.toLowerCase() === session?.email.toLowerCase(),
    ) ?? null;
  const errorMessage = getErrorMessage(query.error);

  const scheduledStart = new Date();
  scheduledStart.setMinutes(0, 0, 0);
  scheduledStart.setHours(scheduledStart.getHours() + 1);
  const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000);
  const dueDate = new Date(scheduledEnd.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Nueva actividad
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Actividad para {record.caseRecord.programName}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Registra llamada, outreach, conferencia de cuidado o seguimiento para{" "}
              {getClientDisplayName(record.client)}.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/cases/${record.caseRecord.id}`}>Volver al caso</Link>
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
          <CardTitle>Actividad / encuentro</CardTitle>
          <CardDescription>
            Cada actividad crea una sesion operativa que luego puede documentarse con nota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/sessions" method="post" className="space-y-6">
            <input type="hidden" name="clientId" value={record.client.id} />
            <input type="hidden" name="caseId" value={record.caseRecord.id} />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="serviceId" className="text-sm font-medium text-foreground">
                  Servicio
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  defaultValue={record.caseRecord.services[0]?.id}
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {record.caseRecord.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.serviceCode} · {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="authorizationId" className="text-sm font-medium text-foreground">
                  Autorizacion
                </label>
                <select
                  id="authorizationId"
                  name="authorizationId"
                  defaultValue=""
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="">Sin autorizacion por ahora</option>
                  {record.caseRecord.services.flatMap((service) =>
                    service.authorizations.map((authorization) => (
                      <option key={authorization.id} value={authorization.id}>
                        {authorization.authorizationNumber} · {service.serviceCode}
                      </option>
                    )),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="employeeId" className="text-sm font-medium text-foreground">
                  Responsable
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  defaultValue={currentEmployee?.id ?? ""}
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="">Sin asignar</option>
                  {activeEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName} · {employee.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="scheduledStart" className="text-sm font-medium text-foreground">
                  Inicio
                </label>
                <Input
                  id="scheduledStart"
                  name="scheduledStart"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocalInput(scheduledStart)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="scheduledEnd" className="text-sm font-medium text-foreground">
                  Fin
                </label>
                <Input
                  id="scheduledEnd"
                  name="scheduledEnd"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocalInput(scheduledEnd)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="documentationDueAt"
                  className="text-sm font-medium text-foreground"
                >
                  Vencimiento de nota
                </label>
                <Input
                  id="documentationDueAt"
                  name="documentationDueAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocalInput(dueDate)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-foreground">
                  Ubicacion
                </label>
                <Input id="location" name="location" defaultValue="Telefono / virtual" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="sessionType" className="text-sm font-medium text-foreground">
                  Tipo de actividad
                </label>
                <Input id="sessionType" name="sessionType" defaultValue="Seguimiento TCM" required />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="attendanceStatus"
                  className="text-sm font-medium text-foreground"
                >
                  Estado
                </label>
                <select
                  id="attendanceStatus"
                  name="attendanceStatus"
                  defaultValue="COMPLETED"
                  className="flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {sessionStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="unitsRendered" className="text-sm font-medium text-foreground">
                  Unidades rendidas
                </label>
                <Input
                  id="unitsRendered"
                  name="unitsRendered"
                  type="number"
                  min="1"
                  defaultValue="1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Guardar actividad
              </Button>
              <Button type="button" asChild variant="outline" size="lg">
                <Link href={`/cases/${record.caseRecord.id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
