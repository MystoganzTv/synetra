import { redirect } from "next/navigation";
import { Mail, ShieldCheck, UserRoundCog, UsersRound } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const session = await requireAuthSession();

  if (session.role !== "Platform Admin") {
    redirect("/dashboard");
  }

  const [users, leads, clients] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.contactLead.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        fullName: true,
        workEmail: true,
        organization: true,
        role: true,
        teamSize: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.client.findMany({
      select: {
        id: true,
        ownerEmail: true,
      },
    }),
  ]);

  const tcmUsers = users.filter((user) => user.role === "TCM");
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const newLeads = leads.filter((lead) => lead.status === "NEW").length;
  const ownedClientCount = clients.filter((client) => client.ownerEmail).length;
  const clientCountByOwner = new Map<string, number>();

  for (const client of clients) {
    if (!client.ownerEmail) {
      continue;
    }

    clientCountByOwner.set(
      client.ownerEmail,
      (clientCountByOwner.get(client.ownerEmail) ?? 0) + 1,
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Admin panel
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Control interno de usuarios, TCMs y pipeline entrante
        </h1>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground">
          Este panel sirve para operar Synetra por dentro: altas, roles, cartera asignada y leads entrantes. El CRM sigue siendo útil para ventas y seguimiento comercial, pero este panel es el lugar correcto para administrar a los TCMs que ya viven dentro del producto.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Usuarios activos"
          value={String(activeUsers)}
          hint="Usuarios internos con acceso actual al workspace."
          icon={ShieldCheck}
        />
        <MetricCard
          title="TCMs registrados"
          value={String(tcmUsers.length)}
          hint="Usuarios con rol TCM listos para operar cartera propia."
          icon={UserRoundCog}
        />
        <MetricCard
          title="Leads nuevos"
          value={String(newLeads)}
          hint="Entradas recientes del funnel comercial aun no atendidas."
          icon={Mail}
        />
        <MetricCard
          title="Clientes asignados"
          value={String(ownedClientCount)}
          hint="Clientes ya vinculados a un owner dentro del producto."
          icon={UsersRound}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Usuarios y control de acceso</CardTitle>
            <CardDescription>
              Vista rápida de admins, revenue ops y TCMs dentro de Synetra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-[24px] border border-border bg-white/70 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={user.status} />
                    <StatusBadge value={user.role} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[20px] bg-accent/45 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Clientes propios
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      {clientCountByOwner.get(user.email) ?? 0}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-accent/45 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Rol actual
                    </p>
                    <p className="mt-2 font-semibold text-foreground">{user.role}</p>
                  </div>
                  <div className="rounded-[20px] bg-accent/45 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Alta
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      {user.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Leads de contacto</CardTitle>
              <CardDescription>
                Entrada comercial capturada desde la web antes de moverla a CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-[24px] border border-border bg-white/70 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{lead.fullName}</p>
                        <p className="text-sm text-muted-foreground">{lead.workEmail}</p>
                      </div>
                      <StatusBadge value={lead.status} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-accent/45 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Organización
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {lead.organization}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-accent/45 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Tamaño / rol
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {[lead.teamSize, lead.role].filter(Boolean).join(" · ") || "Sin detalle"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-accent/35 p-5">
                  <p className="text-lg font-semibold text-foreground">
                    Todavía no hay leads entrantes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Cuando empiecen a entrar formularios desde la web, esta cola te deja revisarlos antes de sincronizar con un CRM.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>Cómo dividir Admin vs CRM</CardTitle>
              <CardDescription>
                Recomendación operativa para Synetra.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">Admin panel interno</p>
                <p className="mt-2">
                  Úsalo para controlar usuarios, roles, cartera, acceso y operación real una vez que el TCM ya es parte del producto.
                </p>
              </div>
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">CRM externo</p>
                <p className="mt-2">
                  Úsalo para pipeline comercial, demos, seguimiento de ventas, nurture y cierre. No reemplaza el panel interno.
                </p>
              </div>
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">Lo correcto para Synetra</p>
                <p className="mt-2">
                  Tener ambos: CRM para pre-venta y admin panel para post-venta y operación del workspace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
