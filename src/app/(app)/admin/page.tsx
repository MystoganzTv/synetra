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
          Internal control for users, TCMs, and incoming pipeline
        </h1>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground">
          This panel operates Synetra from the inside: onboarding, roles, assigned rosters, and incoming leads. A CRM is still useful for sales and commercial follow-up, but this is the right place to manage TCMs who already live inside the product.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active users"
          value={String(activeUsers)}
          hint="Internal users with current workspace access."
          icon={ShieldCheck}
        />
        <MetricCard
          title="Registered TCMs"
          value={String(tcmUsers.length)}
          hint="Users with the TCM role ready to operate their own roster."
          icon={UserRoundCog}
        />
        <MetricCard
          title="New leads"
          value={String(newLeads)}
          hint="Recent funnel entries that have not yet been worked."
          icon={Mail}
        />
        <MetricCard
          title="Assigned clients"
          value={String(ownedClientCount)}
          hint="Clients already linked to an owner inside the product."
          icon={UsersRound}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white/82">
          <CardHeader>
            <CardTitle>Users and access control</CardTitle>
            <CardDescription>
              Quick view of admins, revenue ops, and TCMs inside Synetra.
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
                      Owned clients
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      {clientCountByOwner.get(user.email) ?? 0}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-accent/45 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Current role
                    </p>
                    <p className="mt-2 font-semibold text-foreground">{user.role}</p>
                  </div>
                  <div className="rounded-[20px] bg-accent/45 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Created
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
              <CardTitle>Contact leads</CardTitle>
              <CardDescription>
                Commercial intake captured from the website before moving to CRM.
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
                          Organization
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {lead.organization}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-accent/45 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Team size / role
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {[lead.teamSize, lead.role].filter(Boolean).join(" · ") || "No detail"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-accent/35 p-5">
                  <p className="text-lg font-semibold text-foreground">
                    No inbound leads yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Once forms start coming in from the website, this queue lets you review them before syncing to a CRM.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/82">
            <CardHeader>
              <CardTitle>How to split Admin vs CRM</CardTitle>
              <CardDescription>
                Operating recommendation for Synetra.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">Internal admin panel</p>
                <p className="mt-2">
                  Use it to control users, roles, roster, access, and real operations once the TCM is already part of the product.
                </p>
              </div>
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">External CRM</p>
                <p className="mt-2">
                  Use it for sales pipeline, demos, follow-up, nurture, and closing. It does not replace the internal panel.
                </p>
              </div>
              <div className="rounded-[24px] bg-accent/35 p-5">
                <p className="font-semibold text-foreground">Best setup for Synetra</p>
                <p className="mt-2">
                  Use both: CRM for pre-sales and the admin panel for post-sales workspace operations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
