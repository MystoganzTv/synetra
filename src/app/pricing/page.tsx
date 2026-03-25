import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { pricingTiers } from "@/lib/marketing-content";

export default async function PricingPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Pricing"
          title="Commercial structure for teams buying an operating platform, not a toy dashboard."
          description="Nexora pricing is positioned around implementation scope, workflow complexity, and operational depth. The site should explain the model clearly even before a live sales conversation."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className="bg-white/78">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {tier.name}
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    {tier.price}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {tier.items.map((item) => (
                    <p key={item} className="rounded-[18px] border border-border bg-white/72 px-4 py-3 text-sm text-foreground">
                      {item}
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

