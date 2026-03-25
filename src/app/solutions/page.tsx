import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { solutionPersonas } from "@/lib/marketing-content";

export default async function SolutionsPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Para equipos"
          title="Construido para equipos que operan salud conductual, no solo para llenar pantallas."
          description="Synetra esta estructurado para quienes son responsables de programacion, calidad documental, autorizaciones, facturacion y seguimiento transversal."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {solutionPersonas.map((persona) => (
            <Card key={persona.title} className="bg-white/78">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {persona.title}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {persona.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {persona.outcomes.map((outcome) => (
                    <p key={outcome} className="rounded-[18px] border border-border bg-white/72 px-4 py-3 text-sm text-foreground">
                      {outcome}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
