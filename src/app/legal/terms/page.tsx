import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Aceptación y alcance",
    body: [
      "Al acceder al sitio público de Synetra o interactuar con sus formularios, aceptas usarlo de manera lícita y conforme a estos términos.",
      "Estos términos regulan el uso del sitio público y de materiales informativos. El uso del producto contratado puede estar sujeto además a acuerdos comerciales, anexos de servicio y documentación específica firmada entre Synetra y cada cliente.",
    ],
  },
  {
    title: "Uso permitido del sitio",
    body: [
      "Puedes utilizar el sitio para conocer el producto, solicitar información, coordinar una demo y evaluar una posible relación comercial con Synetra.",
      "No puedes usar el sitio para interferir con su funcionamiento, intentar acceder sin autorización, extraer contenido de forma masiva, introducir software malicioso o suplantar a otra organización o persona.",
    ],
  },
  {
    title: "Cuentas y acceso al producto",
    body: [
      "El acceso al producto está restringido a usuarios autorizados por Synetra o por la organización cliente correspondiente.",
      "Cada organización cliente es responsable de revisar qué usuarios reciben acceso, qué permisos operativos les corresponden y cómo se administran credenciales, bajas, restablecimientos o cambios internos.",
    ],
  },
  {
    title: "Contenido e información comercial",
    body: [
      "La información publicada en el sitio tiene fines informativos y comerciales. Aunque buscamos que el contenido sea útil y actual, algunas descripciones pueden cambiar conforme evoluciona el producto.",
      "Una demo, propuesta o conversación comercial no constituye por sí sola una obligación contractual de prestación hasta que exista un acuerdo aplicable.",
    ],
  },
  {
    title: "Propiedad intelectual",
    body: [
      "El nombre Synetra, su identidad visual, el sitio, los materiales comerciales, la interfaz del producto y su documentación corresponden a Synetra o a sus licenciantes y están protegidos por las normas aplicables de propiedad intelectual.",
      "No se concede ningún derecho de explotación, copia, reventa o distribución fuera del uso razonable permitido para evaluar el servicio, salvo autorización expresa por escrito.",
    ],
  },
  {
    title: "Disponibilidad, cambios y soporte",
    body: [
      "Podemos actualizar, mejorar o reorganizar el sitio, la experiencia comercial o componentes del producto en cualquier momento.",
      "La disponibilidad, niveles de servicio, soporte y compromisos operativos del entorno contratado se rigen por los acuerdos específicos aplicables a cada cliente.",
    ],
  },
  {
    title: "Limitaciones",
    body: [
      "En la máxima medida permitida por la normativa aplicable, el sitio público se ofrece tal como está para fines informativos y de evaluación comercial.",
      "Synetra no será responsable por decisiones tomadas exclusivamente con base en el contenido público del sitio sin la revisión del contexto operativo y contractual correspondiente.",
    ],
  },
  {
    title: "Contacto",
    body: [
      "Si necesitas información adicional sobre estos términos o sobre el proceso comercial, puedes escribir a ventas@synetra.app.",
      "Cuando exista un contrato específico con una organización cliente, ese acuerdo prevalecerá sobre estos términos respecto al servicio contratado.",
    ],
  },
];

export default async function TermsPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Términos"
          title="Términos de uso del sitio de Synetra."
          description="Estas condiciones regulan el uso del sitio público de Synetra y el acceso a materiales comerciales e informativos asociados a la plataforma."
        />

        <Card className="bg-white/78">
          <CardContent className="space-y-8 p-6 text-sm leading-8 text-muted-foreground">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
