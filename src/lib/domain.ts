export type ClientStatus = "LEAD" | "INTAKE" | "ACTIVE" | "HOLD" | "DISCHARGED";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH";
export type CaseStatus = "INTAKE" | "ACTIVE" | "ON_HOLD" | "CLOSED";
export type CaseType =
  | "ABA"
  | "MENTAL_HEALTH"
  | "CARE_COORDINATION"
  | "SCHOOL_SUPPORT";
export type ServiceDiscipline =
  | "ABA"
  | "THERAPY"
  | "PSYCHIATRY"
  | "CARE_COORDINATION"
  | "SKILLS_TRAINING";
export type ServiceStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export type AuthorizationStatus =
  | "REQUESTED"
  | "ACTIVE"
  | "EXPIRING"
  | "EXPIRED"
  | "DENIED";
export type AuthorizationUnitType = "UNITS" | "HOURS" | "VISITS";
export type SessionStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED_NO_SHOW"
  | "CANCELLED_LATE"
  | "DOCUMENTATION_PENDING";
export type NoteStatus = "DRAFT" | "PENDING_SIGNATURE" | "SIGNED" | "LOCKED";
export type BillingStatus = "READY" | "SUBMITTED" | "PAID" | "DENIED" | "HOLD";
export type ComplianceSeverity = "LOW" | "MEDIUM" | "HIGH";
export type ComplianceStatus = "OPEN" | "RESOLVED" | "WAIVED";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type GroupStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "CLOSED";
export type GroupMembershipStatus = "ACTIVE" | "PENDING" | "PAUSED" | "COMPLETED";
export type GroupSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type DocumentCategory =
  | "ASSESSMENT"
  | "PLAN"
  | "CONSENT"
  | "ID"
  | "AUTHORIZATION"
  | "CLINICAL"
  | "LEGAL";
export type DocumentStatus =
  | "CURRENT"
  | "EXPIRING"
  | "EXPIRED"
  | "PENDING_REVIEW"
  | "DRAFT";
export type FormPacketType =
  | "INTAKE"
  | "CONSENT"
  | "ROI"
  | "FINANCIAL"
  | "SAFETY_PLAN";
export type FormPacketStatus =
  | "IN_PROGRESS"
  | "PENDING_SIGNATURE"
  | "COMPLETED"
  | "NEEDS_REVIEW";
export type SignatureStatus = "NOT_STARTED" | "SENT" | "PARTIAL" | "COMPLETE";

export interface BillingRecord {
  id: string;
  claimNumber: string;
  cptCode: string;
  unitsBilled: number;
  amountCents: number;
  status: BillingStatus;
  submittedAt?: string | null;
  paidAt?: string | null;
  denialReason?: string | null;
}

export interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  title: string;
  credentials?: string | null;
  discipline?: ServiceDiscipline | null;
  email?: string | null;
  timezone: string;
  status: EmployeeStatus;
  isBillable: boolean;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  severity: ComplianceSeverity;
  status: ComplianceStatus;
  dueDate?: string | null;
  resolvedAt?: string | null;
  owner: string;
}

export interface ProgressNoteRecord {
  id: string;
  authorName: string;
  status: NoteStatus;
  submittedAt?: string | null;
  signedAt?: string | null;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  incidentReported: boolean;
  billingRecords: BillingRecord[];
  complianceItems: ComplianceItem[];
}

export interface SessionRecord {
  id: string;
  clientId?: string | null;
  caseId?: string | null;
  serviceId?: string | null;
  authorizationId?: string | null;
  employeeId?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  employee?: EmployeeRecord | null;
  clinicianName?: string | null;
  clinicianTitle?: string | null;
  location: string;
  sessionType: string;
  attendanceStatus: SessionStatus;
  unitsRendered: number;
  noteStatus: NoteStatus;
  billingStatus: BillingStatus;
  documentationDueAt?: string | null;
  progressNotes: ProgressNoteRecord[];
}

export interface AuthorizationRecord {
  id: string;
  authorizationNumber: string;
  payerName: string;
  approvedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  unitType: AuthorizationUnitType;
  startDate: string;
  endDate: string;
  status: AuthorizationStatus;
  utilizationThreshold: number;
  notes?: string | null;
  sessions: SessionRecord[];
}

export interface ServiceRecord {
  id: string;
  serviceCode: string;
  title: string;
  discipline: ServiceDiscipline;
  unitType: AuthorizationUnitType;
  defaultUnitsPerSession: number;
  defaultRateCents: number;
  frequency: string;
  status: ServiceStatus;
  isPrimary: boolean;
  authorizations: AuthorizationRecord[];
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  programName: string;
  payerName: string;
  clinicalLead: string;
  renderingProvider?: string | null;
  location: string;
  status: CaseStatus;
  startDate: string;
  endDate?: string | null;
  acuityLevel: string;
  carePlanSummary?: string | null;
  services: ServiceRecord[];
  sessions?: SessionRecord[];
}

export interface ClientRecord {
  id: string;
  externalId: string;
  ownerEmail?: string | null;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  dateOfBirth: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  timezone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  primaryDiagnosisCode?: string | null;
  payerSegment?: string | null;
  referralSource?: string | null;
  cases: CaseRecord[];
}

export interface GroupMembershipRecord {
  id: string;
  clientId: string;
  caseId?: string | null;
  joinedAt: string;
  status: GroupMembershipStatus;
  participationGoal: string;
  attendanceRate: number;
}

export interface GroupSessionRecord {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  facilitatorName: string;
  location: string;
  status: GroupSessionStatus;
  noteCompletionPercent: number;
  attendanceCount: number;
  notesDue: number;
}

export interface GroupRecord {
  id: string;
  name: string;
  track: string;
  serviceLine: string;
  status: GroupStatus;
  facilitatorName: string;
  coFacilitatorName?: string | null;
  location: string;
  schedulePattern: string;
  maxCapacity: number;
  clinicalFocus: string;
  memberships: GroupMembershipRecord[];
  sessions: GroupSessionRecord[];
}

export interface DocumentRecord {
  id: string;
  clientId?: string | null;
  caseId?: string | null;
  groupId?: string | null;
  formPacketId?: string | null;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  owner: string;
  effectiveDate?: string | null;
  expiresAt?: string | null;
  source: string;
  requiresSignature: boolean;
  signedAt?: string | null;
  tags: string[];
}

export interface FormFieldRecord {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "checkbox";
  value?: string | null;
  checked?: boolean;
  placeholder?: string;
}

export interface FormSectionRecord {
  id: string;
  title: string;
  description: string;
  fields: FormFieldRecord[];
}

export interface FormPacketRecord {
  id: string;
  clientId: string;
  caseId?: string | null;
  title: string;
  packetType: FormPacketType;
  status: FormPacketStatus;
  assignedTo: string;
  dueDate: string;
  completedAt?: string | null;
  signatureStatus: SignatureStatus;
  completionPercent: number;
  sections: FormSectionRecord[];
}

export interface CalendarEventRecord {
  id: string;
  startsAt: string;
  endsAt?: string | null;
  title: string;
  subtitle: string;
  eventType: "SESSION" | "GROUP" | "FORM" | "AUTHORIZATION";
  status: string;
  staffName?: string;
  durationMinutes?: number;
  href?: string;
}

export interface CaseContext {
  client: ClientRecord;
  caseRecord: CaseRecord;
}

export interface ServiceContext extends CaseContext {
  service: ServiceRecord;
}

export interface AuthorizationContext extends ServiceContext {
  authorization: AuthorizationRecord;
}

export interface SessionContext extends CaseContext {
  service: ServiceRecord | null;
  authorization: AuthorizationRecord | null;
  employee: EmployeeRecord | null;
  session: SessionRecord;
}

export interface ProgressNoteContext extends SessionContext {
  progressNote: ProgressNoteRecord;
}

export interface BillingContext extends ProgressNoteContext {
  billingRecord: BillingRecord;
}

export interface ComplianceContext extends ProgressNoteContext {
  complianceItem: ComplianceItem;
}

export function getClientDisplayName(client: ClientRecord) {
  return client.preferredName
    ? `${client.preferredName} ${client.lastName}`
    : `${client.firstName} ${client.lastName}`;
}

export function getFullLegalName(client: ClientRecord) {
  return `${client.firstName} ${client.lastName}`;
}

export function flattenCases(clients: ClientRecord[]): CaseContext[] {
  return clients.flatMap((client) =>
    client.cases.map((caseRecord) => ({ client, caseRecord })),
  );
}

export function flattenServices(clients: ClientRecord[]): ServiceContext[] {
  return flattenCases(clients).flatMap(({ client, caseRecord }) =>
    caseRecord.services.map((service) => ({ client, caseRecord, service })),
  );
}

export function flattenAuthorizations(
  clients: ClientRecord[],
): AuthorizationContext[] {
  return flattenServices(clients).flatMap(({ client, caseRecord, service }) =>
    service.authorizations.map((authorization) => ({
      client,
      caseRecord,
      service,
      authorization,
    })),
  );
}

export function flattenSessions(clients: ClientRecord[]): SessionContext[] {
  return flattenCases(clients).flatMap(({ client, caseRecord }) => {
    const sessions = caseRecord.sessions ?? getCaseSessions(caseRecord);

    return sessions.map((session) => {
      const service =
        caseRecord.services.find((candidate) => candidate.id === session.serviceId) ?? null;
      const authorization =
        service?.authorizations.find(
          (candidate) =>
            candidate.id === session.authorizationId ||
            candidate.sessions.some((authorizedSession) => authorizedSession.id === session.id),
        ) ?? null;

      return {
        client,
        caseRecord,
        service,
        authorization,
        employee: session.employee ?? null,
        session,
      };
    });
  });
}

export function flattenProgressNotes(
  clients: ClientRecord[],
): ProgressNoteContext[] {
  return flattenSessions(clients).flatMap(
    ({ client, caseRecord, service, authorization, employee, session }) =>
      session.progressNotes.map((progressNote) => ({
        client,
        caseRecord,
        service,
        authorization,
        employee,
        session,
        progressNote,
      })),
  );
}

export function flattenBilling(clients: ClientRecord[]): BillingContext[] {
  return flattenProgressNotes(clients).flatMap(
    ({
      client,
      caseRecord,
      service,
      authorization,
      employee,
      session,
      progressNote,
    }) =>
      progressNote.billingRecords.map((billingRecord) => ({
        client,
        caseRecord,
        service,
        authorization,
        employee,
        session,
        progressNote,
        billingRecord,
      })),
  );
}

export function flattenCompliance(clients: ClientRecord[]): ComplianceContext[] {
  return flattenProgressNotes(clients).flatMap(
    ({
      client,
      caseRecord,
      service,
      authorization,
      employee,
      session,
      progressNote,
    }) =>
      progressNote.complianceItems.map((complianceItem) => ({
        client,
        caseRecord,
        service,
        authorization,
        employee,
        session,
        progressNote,
        complianceItem,
      })),
  );
}

export function getAuthorizationUtilization(authorization: AuthorizationRecord) {
  if (!authorization.approvedUnits) return 0;
  return (authorization.usedUnits / authorization.approvedUnits) * 100;
}

export function getGroupUtilization(group: GroupRecord) {
  if (!group.maxCapacity) return 0;
  return (group.memberships.length / group.maxCapacity) * 100;
}

export function getGroupNextSession(group: GroupRecord, reference: Date) {
  return group.sessions
    .filter((session) => new Date(session.scheduledStart) >= reference)
    .sort(
      (left, right) =>
        new Date(left.scheduledStart).getTime() -
        new Date(right.scheduledStart).getTime(),
    )[0];
}

export function getCaseUtilization(caseRecord: CaseRecord) {
  const authorizations = caseRecord.services.flatMap(
    (service) => service.authorizations,
  );
  if (!authorizations.length) return 0;

  const approved = authorizations.reduce(
    (sum, authorization) => sum + authorization.approvedUnits,
    0,
  );
  const used = authorizations.reduce(
    (sum, authorization) => sum + authorization.usedUnits,
    0,
  );

  return approved === 0 ? 0 : (used / approved) * 100;
}

export function getCaseSessions(caseRecord: CaseRecord) {
  return (
    caseRecord.sessions ??
    caseRecord.services.flatMap((service) =>
      service.authorizations.flatMap((authorization) =>
        authorization.sessions.map((session) => ({
          ...session,
          serviceId: session.serviceId ?? service.id,
          authorizationId: session.authorizationId ?? authorization.id,
        })),
      ),
    )
  );
}

export function getNextSessionForCase(caseRecord: CaseRecord, reference: Date) {
  return getCaseSessions(caseRecord)
    .filter((session) => new Date(session.scheduledStart) >= reference)
    .sort(
      (left, right) =>
        new Date(left.scheduledStart).getTime() -
        new Date(right.scheduledStart).getTime(),
    )[0];
}

export function getNextSessionForClient(client: ClientRecord, reference: Date) {
  return client.cases
    .flatMap((caseRecord) => getCaseSessions(caseRecord))
    .filter((session) => new Date(session.scheduledStart) >= reference)
    .sort(
      (left, right) =>
        new Date(left.scheduledStart).getTime() -
        new Date(right.scheduledStart).getTime(),
    )[0];
}

export function getSessionEmployeeName(session: SessionRecord) {
  return session.employee?.displayName ?? session.clinicianName ?? "Unassigned employee";
}

export function getSessionEmployeeTitle(session: SessionRecord) {
  return session.employee?.title ?? session.clinicianTitle ?? "No title";
}
