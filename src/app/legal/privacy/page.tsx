import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Privacy"
          title="Privacy page placeholder for a production-ready public site."
          description="This page gives Synetra the public-site structure buyers expect. It should still be reviewed and finalized with legal counsel before production use."
        />

        <Card className="bg-white/78">
          <CardContent className="space-y-5 p-6 text-sm leading-8 text-muted-foreground">
            <p>
              Synetra is intended to support behavioral health operational workflows. Public-site
              privacy language should describe what information is collected, how it is used, and how
              users can contact the organization regarding privacy requests.
            </p>
            <p>
              Before going live for real customer onboarding, this page should be replaced with a
              reviewed privacy policy that reflects your actual data practices, third-party services,
              contact methods, and retention policies.
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
