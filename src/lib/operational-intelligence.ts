import type {
  CaseContext,
  ClientRecord,
  DocumentRecord,
  FormPacketRecord,
  SessionContext,
} from "@/lib/domain";
import {
  flattenAuthorizations,
  flattenBilling,
  flattenCases,
  flattenProgressNotes,
  flattenSessions,
  getAuthorizationUtilization,
  getClientDisplayName,
  getSessionEmployeeName,
} from "@/lib/domain";
import { averageBy, isPast, ratio, sumBy, withinDays } from "@/lib/metrics";
import { getSynchronizedSessionBillingStatus, validateSession } from "@/lib/session-validation";
import { getNow } from "@/lib/time";

export type OperationalIssueType =
  | "MISSING_NOTE"
  | "EXPIRED_AUTHORIZATION"
  | "MISSING_REQUIRED_DOCUMENT"
  | "NON_BILLABLE_SESSION"
  | "BILLING_READINESS";

export type OperationalSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface BillingReadinessCheck {
  id: string;
  sessionId: string;
  clientId: string;
  caseId: string;
  clientName: string;
  caseLabel: string;
  serviceLabel: string;
  scheduledStart: string;
  readinessScore: number;
  readyToBill: boolean;
  blockers: string[];
  warnings: string[];
  revenueAtRiskCents: number;
}

export interface OperationalIssue {
  id: string;
  type: OperationalIssueType;
  severity: OperationalSeverity;
  title: string;
  description: string;
  clientId?: string;
  caseId?: string;
  sessionId?: string;
  href: string;
  owner: string;
  dueDate?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

function getReferenceDate() {
  return getNow();
}

function getActiveCaseDocuments(caseContext: CaseContext, documents: DocumentRecord[]) {
  return documents.filter(
    (document) =>
      document.caseId === caseContext.caseRecord.id || document.clientId === caseContext.client.id,
  );
}

function getRequiredDocumentChecks(caseContext: CaseContext, documents: DocumentRecord[]) {
  const caseDocuments = getActiveCaseDocuments(caseContext, documents);
  const location = caseContext.caseRecord.location.toLowerCase();
  const activePlan = caseDocuments.find(
    (document) =>
      (document.category === "PLAN" || document.category === "CLINICAL") &&
      document.status !== "EXPIRED",
  );
  const activeAssessment = caseDocuments.find(
    (document) => document.category === "ASSESSMENT" && document.status !== "EXPIRED",
  );
  const telehealthConsent = caseDocuments.find(
    (document) => document.category === "CONSENT" && document.status !== "EXPIRED",
  );
  const schoolRoi = caseDocuments.find(
    (document) => document.category === "LEGAL" && document.status !== "EXPIRED",
  );

  const missing: string[] = [];

  if (
    (caseContext.caseRecord.status === "ACTIVE" || caseContext.caseRecord.status === "ON_HOLD") &&
    !activePlan
  ) {
    missing.push("Current treatment plan or clinical document");
  }

  if (caseContext.caseRecord.status === "ACTIVE" && !activeAssessment) {
    missing.push("Current clinical assessment");
  }

  if (location.includes("telehealth") && !telehealthConsent) {
    missing.push("Telehealth consent");
  }

  if (caseContext.caseRecord.caseType === "SCHOOL_SUPPORT" && !schoolRoi) {
    missing.push("Release of information / school legal document");
  }

  return missing;
}

function buildMissingDocumentIssues(clients: ClientRecord[], documents: DocumentRecord[]) {
  return flattenCases(clients).flatMap<OperationalIssue>((caseContext) => {
    const missing = getRequiredDocumentChecks(caseContext, documents);

    if (!missing.length) {
      return [];
    }

    return [
      {
        id: `missing-docs-${caseContext.caseRecord.id}`,
        type: "MISSING_REQUIRED_DOCUMENT",
        severity: caseContext.caseRecord.status === "ACTIVE" ? "HIGH" : "MEDIUM",
        title: `Required documentation is incomplete for ${caseContext.caseRecord.caseNumber}`,
        description: `${getClientDisplayName(caseContext.client)} is missing operational items: ${missing.join(", ")}.`,
        clientId: caseContext.client.id,
        caseId: caseContext.caseRecord.id,
        href: "/documents",
        owner: "Clinical operations",
        metadata: {
          missingCount: missing.length,
        },
      },
    ];
  });
}

function buildAuthorizationIssues(clients: ClientRecord[]) {
  const referenceDate = getReferenceDate();

  return flattenAuthorizations(clients).flatMap<OperationalIssue>((context) => {
    const authExpired =
      context.authorization.status === "EXPIRED" ||
      isPast(context.authorization.endDate, referenceDate);
    const highUtilization =
      getAuthorizationUtilization(context.authorization) >=
      context.authorization.utilizationThreshold;

    if (!authExpired && !highUtilization) {
      return [];
    }

    return [
      {
        id: `auth-risk-${context.authorization.id}`,
        type: "EXPIRED_AUTHORIZATION",
        severity: authExpired ? "HIGH" : "MEDIUM",
        title: authExpired
          ? `Authorization expired for ${context.service?.serviceCode ?? "unlinked service"}`
          : `Authorization nearing limit for ${context.service?.serviceCode ?? "unlinked service"}`,
        description: `${getClientDisplayName(context.client)} in ${context.caseRecord.caseNumber}: ${context.authorization.usedUnits}/${context.authorization.approvedUnits} ${context.authorization.unitType.toLowerCase()} used, ending ${context.authorization.endDate.slice(0, 10)}.`,
        clientId: context.client.id,
        caseId: context.caseRecord.id,
        href: `/cases/${context.caseRecord.id}`,
        owner: "Utilization management",
        dueDate: context.authorization.endDate,
        metadata: {
          utilization: Math.round(getAuthorizationUtilization(context.authorization)),
        },
      },
    ];
  });
}

function getSessionBillingGate(context: SessionContext) {
  const validation = validateSession(context);
  const blockers = [...validation.hardFails];
  const warnings = [...validation.softFails];
  const synchronizedBillingStatus = getSynchronizedSessionBillingStatus(context);

  if (synchronizedBillingStatus === "DENIED") {
    blockers.push("Billing status is synchronized as denied.");
  } else if (synchronizedBillingStatus === "HOLD") {
    warnings.push("Billing status is synchronized as on hold pending operational review.");
  }

  return {
    blockers,
    warnings,
    readyToBill: blockers.length === 0 && warnings.length === 0,
    readinessScore: validation.readinessScore,
    revenueAtRiskCents:
      (context.service?.defaultRateCents ?? 0) * Math.max(context.session.unitsRendered, 1),
  };
}

function buildMissingNotesIssues(clients: ClientRecord[]) {
  const referenceDate = getReferenceDate();

  return flattenSessions(clients).flatMap<OperationalIssue>((context) => {
    const noteSigned = context.session.progressNotes.some(
      (note) => note.status === "SIGNED" || note.status === "LOCKED",
    );
    const sessionCompleted = context.session.attendanceStatus === "COMPLETED";
    const noteMissing = sessionCompleted && !noteSigned;
    const overdue =
      noteMissing &&
      isPast(context.session.documentationDueAt ?? context.session.scheduledEnd, referenceDate);

    if (!noteMissing) {
      return [];
    }

    return [
      {
        id: `missing-note-${context.session.id}`,
        type: "MISSING_NOTE",
        severity: overdue ? "HIGH" : "MEDIUM",
        title: `Missing or incomplete note for ${getClientDisplayName(context.client)}`,
        description: `${context.service?.serviceCode ?? "Unlinked service"} from ${context.session.scheduledStart.slice(0, 10)} is still missing a final clinical signature.`,
        clientId: context.client.id,
        caseId: context.caseRecord.id,
        sessionId: context.session.id,
        href: "/progress-notes",
        owner: getSessionEmployeeName(context.session),
        dueDate: context.session.documentationDueAt ?? context.session.scheduledEnd,
      },
    ];
  });
}

function buildNonBillableIssues(clients: ClientRecord[]) {
  return flattenSessions(clients).flatMap<OperationalIssue>((context) => {
    const gate = getSessionBillingGate(context);

    if (gate.readyToBill) {
      return [];
    }

    return [
      {
        id: `non-billable-${context.session.id}`,
        type: "NON_BILLABLE_SESSION",
        severity: "HIGH",
        title: `Potentially non-billable session: ${getClientDisplayName(context.client)}`,
        description: gate.blockers.join(". "),
        clientId: context.client.id,
        caseId: context.caseRecord.id,
        sessionId: context.session.id,
        href: `/cases/${context.caseRecord.id}`,
        owner: "Revenue operations",
        dueDate: context.session.documentationDueAt ?? context.session.scheduledEnd,
        metadata: {
          readinessScore: Math.round(gate.readinessScore),
        },
      },
    ];
  });
}

export function getBillingReadinessChecks(clients: ClientRecord[]) {
  return flattenSessions(clients)
    .map<BillingReadinessCheck>((context) => {
      const gate = getSessionBillingGate(context);
      return {
        id: `billing-readiness-${context.session.id}`,
        sessionId: context.session.id,
        clientId: context.client.id,
        caseId: context.caseRecord.id,
        clientName: getClientDisplayName(context.client),
        caseLabel: context.caseRecord.caseNumber,
        serviceLabel: context.service
          ? `${context.service.serviceCode} ${context.service.title}`
          : "Unlinked service",
        scheduledStart: context.session.scheduledStart,
        readinessScore: gate.readinessScore,
        readyToBill: gate.readyToBill,
        blockers: gate.blockers,
        warnings: gate.warnings,
        revenueAtRiskCents: gate.revenueAtRiskCents,
      };
    })
    .sort((left, right) => left.readinessScore - right.readinessScore);
}

export function getOperationalIssues(
  clients: ClientRecord[],
  documents: DocumentRecord[],
  forms: FormPacketRecord[],
) {
  const documentIssues = buildMissingDocumentIssues(clients, documents);
  const authIssues = buildAuthorizationIssues(clients);
  const noteIssues = buildMissingNotesIssues(clients);
  const nonBillable = buildNonBillableIssues(clients);
  const referenceDate = getReferenceDate();

  const formIssues: OperationalIssue[] = forms.flatMap((form) => {
    if (
      form.status === "COMPLETED" ||
      (form.signatureStatus === "COMPLETE" && form.completionPercent === 100)
    ) {
      return [];
    }

    return [
      {
        id: `form-readiness-${form.id}`,
        type: "BILLING_READINESS",
        severity:
          form.status === "NEEDS_REVIEW" || isPast(form.dueDate, referenceDate)
            ? "HIGH"
            : "MEDIUM",
        title: `Pending operational packet: ${form.title}`,
        description: `Status ${form.status.toLowerCase()} with signature ${form.signatureStatus.toLowerCase()} and ${form.completionPercent}% completed.`,
        clientId: form.clientId,
        caseId: form.caseId ?? undefined,
        href: "/forms",
        owner: form.assignedTo,
        dueDate: form.dueDate,
      },
    ];
  });

  return [...documentIssues, ...authIssues, ...noteIssues, ...nonBillable, ...formIssues].sort(
    (left, right) => {
      const severityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return severityRank[left.severity] - severityRank[right.severity];
    },
  );
}

export function getOperationalMetrics(
  clients: ClientRecord[],
  documents: DocumentRecord[],
  forms: FormPacketRecord[],
) {
  const readinessChecks = getBillingReadinessChecks(clients);
  const operationalIssues = getOperationalIssues(clients, documents, forms);
  const notes = flattenProgressNotes(clients);
  const sessions = flattenSessions(clients);
  const auths = flattenAuthorizations(clients);
  const billing = flattenBilling(clients);

  return {
    readinessChecks,
    operationalIssues,
    summary: {
      readyToBillCount: readinessChecks.filter((check) => check.readyToBill).length,
      notReadyToBillCount: readinessChecks.filter((check) => !check.readyToBill).length,
      readinessRate: ratio(
        readinessChecks.filter((check) => check.readyToBill).length,
        readinessChecks.length,
      ),
      averageReadinessScore: averageBy(readinessChecks, (check) => check.readinessScore),
      revenueAtRiskCents: sumBy(
        readinessChecks.filter((check) => !check.readyToBill),
        (check) => check.revenueAtRiskCents,
      ),
      missingNoteCount: operationalIssues.filter((issue) => issue.type === "MISSING_NOTE").length,
      expiredAuthorizationCount: operationalIssues.filter(
        (issue) => issue.type === "EXPIRED_AUTHORIZATION",
      ).length,
      missingDocumentCount: operationalIssues.filter(
        (issue) => issue.type === "MISSING_REQUIRED_DOCUMENT",
      ).length,
      nonBillableCount: operationalIssues.filter(
        (issue) => issue.type === "NON_BILLABLE_SESSION",
      ).length,
      formsPendingCount: forms.filter((form) => form.status !== "COMPLETED").length,
      documentsExpiringCount: documents.filter(
        (document) =>
          document.status === "EXPIRING" ||
          withinDays(document.expiresAt, 14, getReferenceDate()),
      ).length,
      signedNoteRate: ratio(
        notes.filter(
          ({ progressNote }) =>
            progressNote.status === "SIGNED" || progressNote.status === "LOCKED",
        ).length,
        notes.length,
      ),
      authorizationCoverageRate: ratio(
        auths.filter(
          ({ authorization }) =>
            authorization.status !== "EXPIRED" && !isPast(authorization.endDate, getReferenceDate()),
        ).length,
        auths.length,
      ),
      submittedRevenueCents: sumBy(billing, ({ billingRecord }) => billingRecord.amountCents),
      sessionsCount: sessions.length,
    },
  };
}
