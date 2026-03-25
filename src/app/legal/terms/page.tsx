import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function TermsPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Terms"
          title="Terms page placeholder for a complete SaaS marketing footprint."
          description="This page completes the public information architecture of the site. It should still be reviewed and finalized legally before using it as live contractual language."
        />

        <Card className="bg-white/78">
          <CardContent className="space-y-5 p-6 text-sm leading-8 text-muted-foreground">
            <p>
              Nexora’s public site should include terms that define acceptable use, access
              expectations, limitations, intellectual property, and other core platform conditions.
            </p>
            <p>
              This placeholder is intentionally conservative. It establishes the route and site
              structure now, while signaling that legal review is still required before production
              customer use.
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
