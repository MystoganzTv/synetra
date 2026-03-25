import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { faqItems } from "@/lib/marketing-content";

export default async function FaqPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="FAQ"
          title="Responde las preguntas duras antes de la llamada comercial."
          description="Un sitio completo debe reducir ambiguedad para el comprador. El FAQ forma parte de la historia del producto."
        />

        <div className="grid gap-4">
          {faqItems.map((item) => (
            <Card key={item.question} className="bg-white/78">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {item.question}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
