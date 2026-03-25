import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Información que recopilamos",
    body: [
      "Podemos recopilar datos que nos compartes directamente al usar el sitio o al solicitar una demo, incluyendo nombre, correo de trabajo, organización, cargo, teléfono, tamaño del equipo y cualquier información que incluyas en mensajes de contacto.",
      "Cuando un cliente utiliza el producto, también pueden procesarse datos operativos necesarios para prestar el servicio, como usuarios internos, estructura organizativa, registros de actividad y configuraciones del entorno contratado.",
    ],
  },
  {
    title: "Cómo utilizamos la información",
    body: [
      "Usamos la información para responder solicitudes comerciales, programar demos, evaluar necesidades de implementación, prestar soporte, proteger la plataforma y mejorar la experiencia del sitio y del producto.",
      "La información enviada por formularios comerciales puede incorporarse a herramientas internas de seguimiento de ventas, implementación o soporte para asegurar continuidad en la atención.",
    ],
  },
  {
    title: "Base operativa del producto",
    body: [
      "Synetra está diseñado para operaciones de salud conductual. El tratamiento de información regulada o sensible dentro del producto puede estar sujeto además a acuerdos específicos con cada organización cliente, incluyendo contratos de servicio, políticas internas y anexos de protección de datos cuando correspondan.",
      "El contenido público del sitio no sustituye esos acuerdos específicos entre Synetra y cada cliente.",
    ],
  },
  {
    title: "Compartición con terceros",
    body: [
      "Podemos compartir información con proveedores que nos ayudan a operar el sitio, la infraestructura, la base de datos, el soporte, las comunicaciones o la programación de reuniones, siempre dentro de una relación de prestación de servicios y bajo controles razonables.",
      "No vendemos la información personal enviada a través del sitio público.",
    ],
  },
  {
    title: "Retención y seguridad",
    body: [
      "Conservamos la información durante el tiempo necesario para operar el servicio, responder solicitudes, cumplir obligaciones contractuales y resolver incidencias o requerimientos legítimos.",
      "Aplicamos medidas razonables de seguridad administrativa, técnica y operativa para proteger la información frente a acceso no autorizado, alteración o pérdida. Ningún método de transmisión o almacenamiento puede garantizar seguridad absoluta.",
    ],
  },
  {
    title: "Tus opciones y contacto",
    body: [
      "Si deseas actualizar, corregir o eliminar información comercial que nos hayas compartido, puedes escribir a ventas@synetra.app y revisaremos la solicitud conforme a la naturaleza de la relación y a nuestras obligaciones aplicables.",
      "Si un cliente necesita gestionar datos dentro de su entorno contratado, esa solicitud puede requerir coordinación con el administrador autorizado de su organización.",
    ],
  },
  {
    title: "Cambios a esta política",
    body: [
      "Podemos actualizar esta política para reflejar cambios del producto, del sitio o de nuestros procesos operativos. Cuando existan cambios materiales, publicaremos una versión actualizada en esta página.",
    ],
  },
];

export default async function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Privacidad"
          title="Política de privacidad de Synetra."
          description="Esta política describe cómo Synetra recopila, utiliza y protege la información compartida a través del sitio público y en el contexto de evaluación comercial del producto."
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
