export const marketingNavigation = [
  { href: "/features", label: "Funciones" },
  { href: "/solutions", label: "Para equipos" },
  { href: "/pricing", label: "Precios" },
  { href: "/resources", label: "Recursos" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Sobre Synetra" },
  { href: "/contacto", label: "Contacto" },
];

export const featureHighlights = [
  {
    title: "Programacion operativa",
    description:
      "Vistas diarias y semanales mantienen sesiones, grupos, utilizacion del equipo y trabajo pendiente visibles en una sola capa operativa.",
    bullets: [
      "Calendario por profesional, servicio y ubicacion",
      "Logica operativa, no solo lista de citas",
      "Detalle de sesion con contexto de notas y facturacion",
    ],
  },
  {
    title: "Documentacion centrada en el caso",
    description:
      "Notas, formularios, documentos y cumplimiento permanecen unidos a la jerarquia cliente → caso → servicio → autorizacion.",
    bullets: [
      "Progress notes ligadas a sesiones realmente prestadas",
      "Seguimiento de formularios de intake y legales",
      "Paginas de caso que funcionan como centro operativo",
    ],
  },
  {
    title: "Control de facturacion lista",
    description:
      "Synetra valida sesiones antes de que los reclamos avancen, para que el equipo corrija riesgos antes de perder reembolso.",
    bullets: [
      "Validacion por autorizacion, rango y unidades",
      "Deteccion de notas faltantes o pendientes de firma",
      "Clasificacion en listo para facturar, en riesgo y no facturable",
    ],
  },
  {
    title: "Visibilidad de cumplimiento",
    description:
      "Documentos requeridos, autorizaciones por vencer, hallazgos de QA y sesiones retenidas aparecen como colas de trabajo y no como sorpresas.",
    bullets: [
      "Centro de cumplimiento por severidad y responsable",
      "Cobertura documental a nivel de caso",
      "Reportes y agregacion de incidencias operativas",
    ],
  },
];

export const solutionPersonas = [
  {
    title: "Fundadores y operadores",
    description:
      "Obtengan control sobre intake, programacion, riesgo de ingresos y seguimiento del equipo antes de que la operacion se vuelva caotica.",
    outcomes: [
      "Saber que es facturable hoy",
      "Reducir puntos ciegos operativos",
      "Escalar con mejores procesos",
    ],
  },
  {
    title: "Directores clinicos",
    description:
      "Lleven la supervision clinica con mejor visibilidad sobre autorizaciones, notas incompletas, calidad y estado del programa.",
    outcomes: [
      "Auditar documentacion por caso",
      "Priorizar supervision y follow-up",
      "Mantener la operacion anclada al expediente",
    ],
  },
  {
    title: "Equipos de ingresos y cumplimiento",
    description:
      "Trabajen con senales reales de billing readiness en vez de perseguir reclamos despues de denegaciones y vacios documentales.",
    outcomes: [
      "Detectar autorizaciones faltantes a tiempo",
      "Retener sesiones riesgosas antes del envio",
      "Ver exposicion de ingresos con contexto operativo",
    ],
  },
];

export const pricingTiers = [
  {
    name: "Growth",
    price: "A medida",
    description:
      "Para organizaciones de salud conductual en crecimiento que necesitan una sola capa operativa conectada.",
    items: [
      "Clientes, casos, servicios, autorizaciones, sesiones y notas",
      "Programacion, seguimiento documental, formularios y cumplimiento",
      "Dashboard operativo, reportes y validacion de facturacion",
    ],
  },
  {
    name: "Operations Plus",
    price: "A medida",
    description:
      "Para equipos multi-programa que necesitan mayor soporte de implementacion y estandarizacion operativa.",
    items: [
      "Todo lo incluido en Growth",
      "Mapeo de flujos operativos e implementacion",
      "Configuracion de entorno, migracion y gobierno de datos",
    ],
  },
  {
    name: "Enterprise",
    price: "A medida",
    description:
      "Para organizaciones grandes que necesitan controles personalizados, rollout y gobierno transversal.",
    items: [
      "Todo lo incluido en Operations Plus",
      "Planificacion avanzada de rollout y onboarding",
      "Reportes personalizados, politicas de datos y soporte de despliegue",
    ],
  },
];

export const resourceCollections = [
  {
    title: "Guias de lanzamiento",
    description:
      "Material de planificacion para equipos que reemplazan flujos desconectados de agenda, notas y reclamos.",
    items: [
      "Checklist de readiness operativo",
      "Guia de implementacion de jerarquia de casos",
      "Worksheet de rollout para billing readiness",
    ],
  },
  {
    title: "Playbooks operativos",
    description:
      "Material de referencia para clinical ops, revenue ops y responsables de cumplimiento en practicas en crecimiento.",
    items: [
      "Manejo de autorizaciones por vencer",
      "Resolucion de sesiones retenidas antes del envio",
      "Cadencia de revision por caso",
    ],
  },
  {
    title: "Material comercial y educativo",
    description:
      "Contenido que explica como Synetra piensa la operacion, no solo la interfaz.",
    items: [
      "Notas de implementacion",
      "Explicaciones de arquitectura operativa",
      "Recorridos de producto y narrativa de demo",
    ],
  },
];

export const faqItems = [
  {
    question: "What is Synetra built for?",
    answer:
      "Synetra esta construido para equipos de salud conductual que necesitan mantener conectados programacion, documentacion, autorizaciones, facturacion y cumplimiento.",
  },
  {
    question: "Is Synetra just a dashboard?",
    answer:
      "No. El dashboard es solo la superficie. El modelo central une sesiones, servicios, autorizaciones, notas, facturacion y cumplimiento para que el equipo pueda actuar sobre lo que ve.",
  },
  {
    question: "Who is Synetra for inside an organization?",
    answer:
      "Fundadores, operadores, directores clinicos, equipos de ingresos y responsables de cumplimiento pueden usar Synetra porque el producto esta construido alrededor del flujo operativo, no de un solo departamento.",
  },
  {
    question: "How does Synetra handle billing readiness?",
    answer:
      "Cada sesion se valida contra cliente, caso, servicio, autorizacion, profesional, unidades, rango de fechas, asistencia y notas. Eso genera estados operativos como listo para facturar, en riesgo y no facturable.",
  },
  {
    question: "Can Synetra support real data and production deployment?",
    answer:
      "Si. La aplicacion esta estructurada con Next.js, Prisma, PostgreSQL, mapeo tipado del dominio y control por entornos. Esta pensada para evolucionar a produccion real, no para quedarse como demo decorativa.",
  },
];

export const aboutPrinciples = [
  {
    title: "Operacion antes que ornamento",
    description:
      "Synetra esta disenado para volver legible el trabajo: que esta programado, que falta, que esta bloqueado y que requiere seguimiento.",
  },
  {
    title: "El contexto clinico no se suelta",
    description:
      "No queremos que facturacion, documentacion y cumplimiento floten separados del caso y del servicio que los origino.",
  },
  {
    title: "Arquitectura lista para produccion",
    description:
      "La base del producto prioriza type safety, relaciones reales, control por entornos, modelos Prisma y logica de validacion operativa.",
  },
];
