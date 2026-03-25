import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { aboutPrinciples } from "@/lib/marketing-content";

export default async function AboutPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="About"
          title="Synetra is designed around operational clarity in behavioral health."
          description="The product direction is simple: keep the clinical thread intact while making operational work visible, actionable, and scalable."
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
