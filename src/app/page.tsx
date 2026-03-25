import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileCheck2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import {
  faqItems,
  featureHighlights,
  pricingTiers,
  resourceCollections,
  solutionPersonas,
} from "@/lib/marketing-content";

const proofItems = [
  {
    label: "Billing readiness",
    value: "Real validation",
    detail: "Sessions, authorizations, and notes are checked before claims move forward.",
    icon: BarChart3,
  },
  {
    label: "Scheduling",
    value: "Ops-aware calendar",
    detail: "Week and day views keep service delivery visible across staff, groups, and follow-up.",
    icon: CalendarDays,
  },
  {
    label: "Documentation",
    value: "Clinical flow",
    detail: "Progress notes, forms, documents, and signatures stay tied to the case hierarchy.",
    icon: FileCheck2,
  },
  {
    label: "Compliance",
    value: "Proactive alerts",
    detail: "Missing notes, expiring authorizations, and document gaps become operational work queues.",
    icon: ShieldAlert,
  },
];

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-14%] h-[30rem] w-[30rem] rounded-full bg-[#67e3ff]/18 blur-3xl" />
        <div className="absolute right-[-8%] top-[0%] h-[28rem] w-[28rem] rounded-full bg-[#8a6cff]/18 blur-3xl" />
        <div className="absolute left-[20%] top-[38%] h-[20rem] w-[20rem] rounded-full bg-[#3158ff]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/80 bg-white/70 px-5 py-4 shadow-[0_20px_50px_-32px_rgba(18,27,79,0.25)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <NexoraLogo compact />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={session ? "/dashboard" : "/login"}>
                {session ? "Open command center" : "Request access"}
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
                Behavioral health operations platform
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Run scheduling, documentation, billing readiness, and compliance from one operating layer.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Nexora is designed for behavioral health teams that need more than a pretty dashboard.
                It turns client, case, authorization, session, and note data into daily operational control.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-2xl px-6">
                <Link href={session ? "/dashboard" : "/login"}>
                  {session ? "Continue to dashboard" : "Sign in to Nexora"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl px-6">
                <Link href="/login">View demo access</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {proofItems.map(({ label, value, detail, icon: Icon }) => (
                <Card key={label} className="bg-white/78">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-lg font-semibold text-foreground">{value}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-none bg-[linear-gradient(140deg,#071238_0%,#132d8d_52%,#6f4cff_100%)] text-white shadow-[0_30px_80px_-46px_rgba(31,53,168,0.65)]">
            <CardContent className="space-y-8 px-7 py-8 sm:px-8 sm:py-9">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.34em] text-white/72">
                  Why teams move to Nexora
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Operational clarity without losing the clinical thread.
                </h2>
                <p className="text-sm leading-7 text-white/82">
                  Built around the real hierarchy of care delivery, so every alert, note, and claim
                  stays anchored to the service and authorization that created it.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Connected hierarchy</p>
                  <p className="mt-2 text-xl font-semibold">Client → Case → Service → Authorization → Session</p>
                </div>
                <div className="rounded-[24px] border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Daily control</p>
                  <p className="mt-2 text-xl font-semibold">Validation, risk surfacing, and action queues</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/14 bg-[rgba(255,255,255,0.12)] p-6 backdrop-blur">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-white/70">Readiness posture</p>
                    <p className="mt-2 text-3xl font-semibold">Live</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Case command page</p>
                    <p className="mt-2 text-3xl font-semibold">Built</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Scheduling layer</p>
                    <p className="mt-2 text-3xl font-semibold">Interactive</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
                Platform depth
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                A public site that explains the product, not just presents it.
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/features">
                Explore all platform pages
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {featureHighlights.map((item) => (
              <Card key={item.title} className="bg-white/78">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                  <div className="space-y-2">
                    {item.bullets.map((bullet) => (
                      <p key={bullet} className="text-sm text-foreground">
                        {bullet}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
                  Who Nexora serves
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Different teams, one operational source of truth.
                </h2>
              </div>

              <div className="space-y-4">
                {solutionPersonas.map((persona) => (
                  <div key={persona.title} className="rounded-[24px] border border-border bg-white/70 p-5">
                    <p className="text-lg font-semibold text-foreground">{persona.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {persona.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {resourceCollections.map((collection) => (
              <Card key={collection.title} className="bg-white/78">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                      Resources
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      {collection.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {collection.description}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {collection.items.map((item) => (
                      <div key={item} className="rounded-[22px] border border-border bg-white/70 p-4 text-sm font-medium text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
                  Pricing posture
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Commercial pages with real structure, not placeholder marketing.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="rounded-[24px] border border-border bg-white/72 p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {tier.name}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{tier.price}</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/78">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
                  FAQ
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Answer the buying questions directly.
                </h2>
              </div>
              {faqItems.slice(0, 3).map((item) => (
                <div key={item.question} className="rounded-[22px] border border-border bg-white/72 p-5">
                  <p className="font-semibold text-foreground">{item.question}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
