export const marketingNavigation = [
  { href: "/features", label: "Features" },
  { href: "/solutions", label: "Who We Serve" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export const featureHighlights = [
  {
    title: "Operational scheduling",
    description:
      "Day and week views keep sessions, groups, staff utilization, and follow-up work visible in one operating layer.",
    bullets: [
      "Calendar by employee, service, and location",
      "Operational scheduling posture, not just appointment lists",
      "Session detail with billing and note readiness context",
    ],
  },
  {
    title: "Case-centered documentation",
    description:
      "Notes, forms, documents, and compliance stay attached to the client → case → service → authorization hierarchy.",
    bullets: [
      "Progress notes tied directly to rendered sessions",
      "Intake and legal packet completion tracking",
      "Case pages that act like operational command centers",
    ],
  },
  {
    title: "Revenue readiness controls",
    description:
      "Nexora validates sessions before claims move downstream, so operational teams can act before reimbursement slips.",
    bullets: [
      "Authorization active/range/unit validation",
      "Missing-note and pending-signature detection",
      "Ready to bill, at risk, and not billable classification",
    ],
  },
  {
    title: "Compliance visibility",
    description:
      "Required documents, expiring authorizations, unresolved QA items, and held sessions surface as work queues instead of surprises.",
    bullets: [
      "Compliance center by severity and owner",
      "Required-document coverage at case level",
      "Reports and operational issue aggregation",
    ],
  },
];

export const solutionPersonas = [
  {
    title: "Founders and operators",
    description:
      "Get control of intake, scheduling, revenue risk, and team follow-through before the operation becomes noisy.",
    outcomes: [
      "Know what is billable today",
      "Reduce operational blind spots",
      "Scale with cleaner workflow discipline",
    ],
  },
  {
    title: "Clinical directors",
    description:
      "Run clinical oversight with better visibility into authorizations, incomplete notes, quality signals, and program readiness.",
    outcomes: [
      "Audit documentation posture by case",
      "Prioritize supervision and follow-up",
      "Keep care operations anchored to the record",
    ],
  },
  {
    title: "Revenue and compliance teams",
    description:
      "Work from real billing-readiness signals instead of chasing claims after denials and documentation gaps appear.",
    outcomes: [
      "Catch missing authorizations early",
      "Hold risky sessions before submission",
      "See revenue exposure with operational context",
    ],
  },
];

export const pricingTiers = [
  {
    name: "Growth",
    price: "Custom",
    description:
      "For newer and growing behavioral health organizations that need one connected operating layer.",
    items: [
      "Clients, cases, services, authorizations, sessions, and notes",
      "Scheduling, document tracking, forms, and compliance center",
      "Operational dashboard, reports, and billing readiness checks",
    ],
  },
  {
    name: "Operations Plus",
    price: "Custom",
    description:
      "For multi-program teams that need deeper implementation support and process standardization.",
    items: [
      "Everything in Growth",
      "Implementation mapping for operational workflows",
      "Environment setup, migration planning, and data governance support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "For larger organizations that need custom controls, rollout planning, and cross-team governance.",
    items: [
      "Everything in Operations Plus",
      "Advanced rollout planning and stakeholder onboarding",
      "Custom reporting, data policies, and deployment support",
    ],
  },
];

export const resourceCollections = [
  {
    title: "Launch guides",
    description:
      "Planning material for teams replacing disconnected scheduling, notes, and claims workflows.",
    items: [
      "Operational readiness checklist",
      "Case hierarchy implementation guide",
      "Billing-readiness rollout worksheet",
    ],
  },
  {
    title: "Workflow playbooks",
    description:
      "Reference material for clinical ops, revenue ops, and compliance leads inside growing practices.",
    items: [
      "Handling expiring authorizations",
      "Resolving held sessions before claims submission",
      "Building a case review cadence",
    ],
  },
  {
    title: "Proof and education",
    description:
      "Content that explains how Nexora thinks about operational correctness, not just interface polish.",
    items: [
      "Implementation notes",
      "Operational architecture explainers",
      "Product walkthroughs and demo narratives",
    ],
  },
];

export const faqItems = [
  {
    question: "What is Nexora built for?",
    answer:
      "Nexora is built for behavioral health operations teams that need scheduling, documentation, authorization oversight, billing readiness, and compliance to stay connected in one system.",
  },
  {
    question: "Is Nexora just a dashboard?",
    answer:
      "No. The dashboard is only the surface. The core model ties sessions, services, authorizations, progress notes, billing posture, and compliance issues together so teams can actually act on what they see.",
  },
  {
    question: "Who is Nexora for inside an organization?",
    answer:
      "Founders, operators, clinical directors, revenue teams, and compliance leads can all use Nexora because the product is built around operational flow, not a single department’s view.",
  },
  {
    question: "How does Nexora handle billing readiness?",
    answer:
      "Each session is validated against linked client, case, service, authorization, employee, units, date range, attendance, and note completion. That produces operational statuses like ready to bill, at risk, and not billable.",
  },
  {
    question: "Can Nexora support real data and production deployment?",
    answer:
      "Yes. The application is structured around Next.js, Prisma, PostgreSQL, typed domain mapping, and environment-based data safety. It is meant to evolve into a real production system, not stay as a toy demo.",
  },
];

export const aboutPrinciples = [
  {
    title: "Operations before ornament",
    description:
      "Nexora is designed to make the work legible: what is scheduled, what is missing, what is blocked, and what needs follow-through.",
  },
  {
    title: "Clinical context stays attached",
    description:
      "We do not want billing, documentation, and compliance floating separately from the case and service that created them.",
  },
  {
    title: "Production-style architecture",
    description:
      "The product foundation prioritizes type safety, real relations, environment control, Prisma-backed data models, and operational validation logic.",
  },
];

