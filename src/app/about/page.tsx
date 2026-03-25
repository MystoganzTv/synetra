import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { aboutPrinciples } from "@/lib/marketing-content";

export default async function AboutPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Sobre Synetra"
          title="Synetra esta diseniado alrededor de la claridad operativa en salud conductual."
          description="La direccion del producto es simple: mantener el hilo clinico intacto mientras el trabajo operativo se vuelve visible, accionable y escalable."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {aboutPrinciples.map((principle) => (
            <Card key={principle.title} className="bg-white/78">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {principle.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {principle.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
