import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { demoClients as rawDemoClients, demoStandaloneSessions } from "@/lib/demo-data";
import { DataAccessError, assertDemoModeAllowed, isDemoModeEnabled, logQueryFailure } from "@/lib/data-source";
import type {
  AuthorizationRecord,
  BillingRecord,
  CaseRecord,
  ClientRecord,
  ComplianceItem,
  EmployeeRecord,
  ProgressNoteRecord,
  ServiceRecord,
  SessionRecord,
} from "@/lib/domain";
import {
  flattenAuthorizations,
  flattenBilling,
  flattenCases,
  flattenCompliance,
  flattenProgressNotes,
  flattenSessions,
  getAuthorizationUtilization,
} from "@/lib/domain";
import { addDays, getNow } from "@/lib/time";

const progressNoteInclude = {
  billingRecords: true,
  complianceItems: true,
} satisfies Prisma.ProgressNoteInclude;

const sessionInclude = {
  progressNotes: {
    include: progressNoteInclude,
  },
  authorization: true,
  employee: true,
} satisfies Prisma.SessionInclude;

const clientGraphInclude = {
  cases: {
    include: {
      services: {
        include: {
          authorizations: {
            include: {
              sessions: {
                include: sessionInclude,
              },
            },
          },
        },
      },
      sessions: {
        include: sessionInclude,
      },
    },
  },
} satisfies Prisma.ClientInclude;

type PrismaClientGraph = Prisma.ClientGetPayload<{
  include: typeof clientGraphInclude;
}>;

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitName(displayName: string) {
  const parts = displayName.trim().split(/\s+/);
  const lastName = parts.pop() ?? displayName;
  const firstName = parts.join(" ") || lastName;
  return { firstName, lastName };
}

function mapEmployee(record: {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  title: string;
  credentials: string | null;
  discipline: EmployeeRecord["discipline"];
  email: string | null;
  timezone: string;
  status: EmployeeRecord["status"];
  isBillable: boolean;
}): EmployeeRecord {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    displayName: record.displayName,
    title: record.title,
    credentials: record.credentials,
    discipline: record.discipline,
    email: record.email,
    timezone: record.timezone,
    status: record.status,
    isBillable: record.isBillable,
  };
}

function mapBillingRecord(record: {
  id: string;
  claimNumber: string;
  cptCode: string;
  unitsBilled: number;
  amountCents: number;
  status: BillingRecord["status"];
  submittedAt: Date | null;
  paidAt: Date | null;
  denialReason: string | null;
}): BillingRecord {
  return {
    id: record.id,
    claimNumber: record.claimNumber,
    cptCode: record.cptCode,
    unitsBilled: record.unitsBilled,
    amountCents: record.amountCents,
    status: record.status,
    submittedAt: toIsoString(record.submittedAt),
    paidAt: toIsoString(record.paidAt),
    denialReason: record.denialReason,
  };
}

function mapComplianceItem(record: {
  id: string;
  title: string;
  description: string;
  severity: ComplianceItem["severity"];
  status: ComplianceItem["status"];
  dueDate: Date | null;
  resolvedAt: Date | null;
  owner: string;
}): ComplianceItem {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    severity: record.severity,
    status: record.status,
    dueDate: toIsoString(record.dueDate),
    resolvedAt: toIsoString(record.resolvedAt),
    owner: record.owner,
  };
}

function mapProgressNote(record: {
  id: string;
  authorName: string;
  status: ProgressNoteRecord["status"];
  submittedAt: Date | null;
  signedAt: Date | null;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  incidentReported: boolean;
  billingRecords: Parameters<typeof mapBillingRecord>[0][];
  complianceItems: Parameters<typeof mapComplianceItem>[0][];
}): ProgressNoteRecord {
  return {
    id: record.id,
    authorName: record.authorName,
    status: record.status,
    submittedAt: toIsoString(record.submittedAt),
    signedAt: toIsoString(record.signedAt),
    subjective: record.subjective,
    objective: record.objective,
    assessment: record.assessment,
    plan: record.plan,
    incidentReported: record.incidentReported,
    billingRecords: record.billingRecords.map(mapBillingRecord),
    complianceItems: record.complianceItems.map(mapComplianceItem),
  };
}

function mapSession(record: {
  id: string;
  clientId: string;
  caseId: string;
  serviceId: string;
  authorizationId: string | null;
  employeeId: string | null;
  employee: Parameters<typeof mapEmployee>[0] | null;
  scheduledStart: Date;
  scheduledEnd: Date;
  location: string;
  sessionType: string;
  attendanceStatus: SessionRecord["attendanceStatus"];
  unitsRendered: number;
  noteStatus: SessionRecord["noteStatus"];
  billingStatus: SessionRecord["billingStatus"];
  documentationDueAt: Date | null;
  progressNotes: Parameters<typeof mapProgressNote>[0][];
}): SessionRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    caseId: record.caseId,
    serviceId: record.serviceId,
    authorizationId: record.authorizationId,
    employeeId: record.employeeId,
    employee: record.employee ? mapEmployee(record.employee) : null,
    scheduledStart: record.scheduledStart.toISOString(),
    scheduledEnd: record.scheduledEnd.toISOString(),
    location: record.location,
    sessionType: record.sessionType,
    attendanceStatus: record.attendanceStatus,
    unitsRendered: record.unitsRendered,
    noteStatus: record.noteStatus,
    billingStatus: record.billingStatus,
    documentationDueAt: toIsoString(record.documentationDueAt),
    progressNotes: record.progressNotes.map(mapProgressNote),
  };
}

function mapAuthorization(record: {
  id: string;
  authorizationNumber: string;
  payerName: string;
  approvedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  unitType: AuthorizationRecord["unitType"];
  startDate: Date;
  endDate: Date;
  status: AuthorizationRecord["status"];
  utilizationThreshold: number;
  notes: string | null;
  sessions: Parameters<typeof mapSession>[0][];
}): AuthorizationRecord {
  return {
    id: record.id,
    authorizationNumber: record.authorizationNumber,
    payerName: record.payerName,
    approvedUnits: record.approvedUnits,
    usedUnits: record.usedUnits,
    remainingUnits: record.remainingUnits,
    unitType: record.unitType,
    startDate: record.startDate.toISOString(),
    endDate: record.endDate.toISOString(),
    status: record.status,
    utilizationThreshold: record.utilizationThreshold,
    notes: record.notes,
    sessions: record.sessions
      .map(mapSession)
      .sort(
        (left, right) =>
          new Date(left.scheduledStart).getTime() -
          new Date(right.scheduledStart).getTime(),
      ),
  };
}

function mapService(record: {
  id: string;
  serviceCode: string;
  title: string;
  discipline: ServiceRecord["discipline"];
  unitType: ServiceRecord["unitType"];
  defaultUnitsPerSession: number;
  defaultRateCents: number;
  frequency: string;
  status: ServiceRecord["status"];
  isPrimary: boolean;
  authorizations: Parameters<typeof mapAuthorization>[0][];
}): ServiceRecord {
  return {
    id: record.id,
    serviceCode: record.serviceCode,
    title: record.title,
    discipline: record.discipline,
    unitType: record.unitType,
    defaultUnitsPerSession: record.defaultUnitsPerSession,
    defaultRateCents: record.defaultRateCents,
    frequency: record.frequency,
    status: record.status,
    isPrimary: record.isPrimary,
    authorizations: record.authorizations
      .map(mapAuthorization)
      .sort(
        (left, right) =>
          new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
      ),
  };
}

function mapCase(record: {
  id: string;
  caseNumber: string;
  caseType: CaseRecord["caseType"];
  programName: string;
  payerName: string;
  clinicalLead: string;
  renderingProvider: string | null;
  location: string;
  status: CaseRecord["status"];
  startDate: Date;
  endDate: Date | null;
  acuityLevel: string;
  carePlanSummary: string | null;
  services: Parameters<typeof mapService>[0][];
  sessions: Parameters<typeof mapSession>[0][];
}): CaseRecord {
  return {
    id: record.id,
    caseNumber: record.caseNumber,
    caseType: record.caseType,
    programName: record.programName,
    payerName: record.payerName,
    clinicalLead: record.clinicalLead,
    renderingProvider: record.renderingProvider,
    location: record.location,
    status: record.status,
    startDate: record.startDate.toISOString(),
    endDate: toIsoString(record.endDate),
    acuityLevel: record.acuityLevel,
    carePlanSummary: record.carePlanSummary,
    services: record.services.map(mapService),
    sessions: record.sessions
      .map(mapSession)
      .sort(
        (left, right) =>
          new Date(left.scheduledStart).getTime() -
          new Date(right.scheduledStart).getTime(),
      ),
  };
}

function mapClient(record: PrismaClientGraph): ClientRecord {
  return {
    id: record.id,
    externalId: record.externalId,
    firstName: record.firstName,
    lastName: record.lastName,
    preferredName: record.preferredName,
    dateOfBirth: record.dateOfBirth.toISOString(),
    email: record.email,
    phone: record.phone,
    city: record.city,
    state: record.state,
    timezone: record.timezone,
    status: record.status,
    riskLevel: record.riskLevel,
    primaryDiagnosisCode: record.primaryDiagnosisCode,
    payerSegment: record.payerSegment,
    referralSource: record.referralSource,
    cases: record.cases.map(mapCase),
  };
}

function buildDemoEmployee(
  employeeMap: Map<string, EmployeeRecord>,
  clinicianName?: string | null,
  clinicianTitle?: string | null,
) {
  if (!clinicianName?.trim()) {
    return null;
  }

  const key = `${clinicianName}::${clinicianTitle ?? ""}`;
  const existing = employeeMap.get(key);

  if (existing) {
    return existing;
  }

  const { firstName, lastName } = splitName(clinicianName);
  const employee: EmployeeRecord = {
    id: `employee-${slugify(clinicianName)}`,
    firstName,
    lastName,
    displayName: clinicianName,
    title: clinicianTitle ?? "Clinician",
    credentials: null,
    discipline: null,
    email: `${slugify(clinicianName)}@nexora.demo`,
    timezone: "America/New_York",
    status: "ACTIVE",
    isBillable: true,
  };

  employeeMap.set(key, employee);
  return employee;
}

function getNormalizedDemoClients() {
  const employeeMap = new Map<string, EmployeeRecord>();

  return rawDemoClients.map<ClientRecord>((client) => ({
    ...client,
    cases: client.cases.map((caseRecord) => {
      const normalizedServices = caseRecord.services.map((service) => ({
        ...service,
        authorizations: service.authorizations.map((authorization) => ({
          ...authorization,
          sessions: authorization.sessions.map((session) => {
            const employee = buildDemoEmployee(
              employeeMap,
              session.clinicianName,
              session.clinicianTitle,
            );

            return {
              ...session,
              clientId: client.id,
              caseId: caseRecord.id,
              serviceId: service.id,
              authorizationId: authorization.id,
              employeeId: employee?.id ?? null,
              employee,
            };
          }),
        })),
      }));

      const authorizedSessions = normalizedServices
        .flatMap((service) => service.authorizations)
        .flatMap((authorization) => authorization.sessions)
      const standaloneSessions = demoStandaloneSessions
        .filter((session) => session.caseId === caseRecord.id)
        .map((session) => {
          const employee = buildDemoEmployee(
            employeeMap,
            session.clinicianName,
            session.clinicianTitle,
          );

          return {
            ...session,
            clientId: session.clientId ?? client.id,
            caseId: session.caseId ?? caseRecord.id,
            serviceId: session.serviceId ?? "",
            authorizationId: session.authorizationId ?? null,
            employeeId: employee?.id ?? null,
            employee,
          };
        });

      const normalizedSessions = [...authorizedSessions, ...standaloneSessions]
        .sort(
          (left, right) =>
            new Date(left.scheduledStart).getTime() -
            new Date(right.scheduledStart).getTime(),
        );

      return {
        ...caseRecord,
        services: normalizedServices,
        sessions: normalizedSessions,
      };
    }),
  }));
}

async function fetchClientsFromPrisma() {
  const scope = "client graph";
  assertDemoModeAllowed(scope);

  if (isDemoModeEnabled()) {
    return getNormalizedDemoClients();
  }

  if (!process.env.DATABASE_URL) {
    throw new DataAccessError(
      "DATA_SOURCE_NOT_CONFIGURED",
      scope,
      "DATABASE_URL is required when demo mode is disabled.",
    );
  }

  try {
    const records = await prisma.client.findMany({
      include: clientGraphInclude,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return records.map(mapClient);
  } catch (error) {
    logQueryFailure(scope, error);
    throw new DataAccessError(
      "PRISMA_QUERY_FAILED",
      scope,
      "Unable to load the client graph from Prisma.",
    );
  }
}

export async function getClients() {
  return fetchClientsFromPrisma();
}

export async function getClient(clientId: string) {
  const clients = await getClients();
  return clients.find((client) => client.id === clientId) ?? null;
}

export async function getCases() {
  return flattenCases(await getClients());
}

export async function getCase(caseId: string) {
  return (await getCases()).find(({ caseRecord }) => caseRecord.id === caseId) ?? null;
}

export async function getSession(sessionId: string) {
  return (
    flattenSessions(await getClients()).find(({ session }) => session.id === sessionId) ?? null
  );
}

export async function getDashboardData() {
  const clients = await getClients();
  const referenceDate = getNow();
  const cases = flattenCases(clients);
  const authorizations = flattenAuthorizations(clients);
  const sessions = flattenSessions(clients);
  const billing = flattenBilling(clients);
  const compliance = flattenCompliance(clients);
  const notes = flattenProgressNotes(clients);
  const nextSevenDays = addDays(referenceDate, 7);

  const activeClients = clients.filter((client) => client.status === "ACTIVE").length;
  const activeCases = cases.filter(
    ({ caseRecord }) => caseRecord.status === "ACTIVE",
  ).length;
  const upcomingSessions = sessions
    .filter(({ session }) => new Date(session.scheduledStart) >= referenceDate)
    .sort(
      (left, right) =>
        new Date(left.session.scheduledStart).getTime() -
        new Date(right.session.scheduledStart).getTime(),
    )
    .slice(0, 6);
  const authorizationsAtRisk = authorizations.filter(({ authorization }) => {
    const utilization = getAuthorizationUtilization(authorization);
    return (
      authorization.status === "EXPIRING" ||
      authorization.status === "EXPIRED" ||
      utilization >= authorization.utilizationThreshold
    );
  });
  const unsignedNotes = notes.filter(
    ({ progressNote }) =>
      progressNote.status === "DRAFT" || progressNote.status === "PENDING_SIGNATURE",
  ).length;
  const claimsOnHold = billing.filter(
    ({ billingRecord }) =>
      billingRecord.status === "HOLD" || billingRecord.status === "DENIED",
  ).length;
  const openCompliance = compliance.filter(
    ({ complianceItem }) => complianceItem.status === "OPEN",
  );
  const signedNotes = notes.filter(
    ({ progressNote }) =>
      progressNote.status === "SIGNED" || progressNote.status === "LOCKED",
  ).length;
  const documentationCompletion =
    notes.length === 0 ? 0 : (signedNotes / notes.length) * 100;
  const submittedRevenue = billing
    .filter(
      ({ billingRecord }) =>
        billingRecord.status === "READY" ||
        billingRecord.status === "SUBMITTED" ||
        billingRecord.status === "PAID",
    )
    .reduce((sum, { billingRecord }) => sum + billingRecord.amountCents, 0);
  const caseLoadByLead = cases.reduce<
    Record<
      string,
      { lead: string; activeCases: number; activeClients: number; sessionsNext7Days: number }
    >
  >((accumulator, { client, caseRecord }) => {
    const current = accumulator[caseRecord.clinicalLead] ?? {
      lead: caseRecord.clinicalLead,
      activeCases: 0,
      activeClients: 0,
      sessionsNext7Days: 0,
    };

    current.activeCases += caseRecord.status === "ACTIVE" ? 1 : 0;
    current.activeClients += client.status === "ACTIVE" ? 1 : 0;
    current.sessionsNext7Days += (caseRecord.sessions ?? [])
      .filter((session) => {
        const sessionDate = new Date(session.scheduledStart);
        return sessionDate >= referenceDate && sessionDate <= nextSevenDays;
      }).length;

    accumulator[caseRecord.clinicalLead] = current;
    return accumulator;
  }, {});

  return {
    referenceDate,
    clients,
    activeClients,
    activeCases,
    upcomingSessions,
    authorizationsAtRisk,
    unsignedNotes,
    claimsOnHold,
    openCompliance,
    documentationCompletion,
    submittedRevenue,
    caseLoadByLead: Object.values(caseLoadByLead).sort(
      (left, right) => right.activeCases - left.activeCases,
    ),
  };
}

export async function getSidebarSummary() {
  const dashboard = await getDashboardData();

  return {
    activeClients: dashboard.activeClients,
    unsignedNotes: dashboard.unsignedNotes,
    expiringAuthorizations: dashboard.authorizationsAtRisk.length,
    claimsOnHold: dashboard.claimsOnHold,
    openCompliance: dashboard.openCompliance.length,
  };
}
