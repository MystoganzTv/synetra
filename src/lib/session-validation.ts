import type { BillingStatus, SessionContext } from "@/lib/domain";

export type SessionValidationStatus = "valid" | "warning" | "invalid";
export type SessionBillingOperationalStatus =
  | "READY_TO_BILL"
  | "AT_RISK"
  | "NOT_BILLABLE";
export type SessionValidationCheckStatus = "pass" | "warning" | "fail";

export interface SessionValidationCheck {
  id: string;
  label: string;
  status: SessionValidationCheckStatus;
  detail: string;
}

export interface SessionValidationResult {
  validationStatus: SessionValidationStatus;
  billingStatus: SessionBillingOperationalStatus;
  readyToBill: boolean;
  readinessScore: number;
  hardFails: string[];
  softFails: string[];
  blockers: string[];
  warnings: string[];
  checks: SessionValidationCheck[];
  ownership: {
    hasClient: boolean;
    hasCase: boolean;
    hasService: boolean;
    hasAuthorization: boolean;
    hasEmployee: boolean;
  };
  authorizationActive: boolean;
  sessionWithinAuthorizationRange: boolean;
  unitsAvailable: boolean;
  progressNoteCompleted: boolean;
  attendanceBillable: boolean;
  attendanceCompleted: boolean;
  unitsNeeded: number;
  unitsRemaining: number;
}

function getProgressNoteCompleted(session: SessionContext["session"]) {
  if (session.progressNotes.length === 0) {
    return false;
  }

  return session.progressNotes.every(
    (note) => note.status === "SIGNED" || note.status === "LOCKED",
  );
}

function getProgressNoteSoftFail(session: SessionContext["session"]) {
  if (session.noteStatus === "PENDING_SIGNATURE") {
    return "Progress note is pending signature.";
  }

  if (session.noteStatus === "DRAFT") {
    return "Progress note is still in draft.";
  }

  if (session.progressNotes.length === 0) {
    return "Progress note is missing.";
  }

  return "Progress note is incomplete.";
}

function getCheckStatus(condition: boolean): SessionValidationCheckStatus {
  return condition ? "pass" : "fail";
}

function getReadinessScore(checks: SessionValidationCheck[]) {
  const score = checks.reduce((total, check) => {
    if (check.status === "pass") return total + 1;
    if (check.status === "warning") return total + 0.5;
    return total;
  }, 0);

  return checks.length === 0 ? 0 : (score / checks.length) * 100;
}

export function validateSession(session: SessionContext): SessionValidationResult {
  const hasClient = Boolean(session.client.id);
  const hasCase = Boolean(session.caseRecord.id);
  const hasService = Boolean(session.service?.id);
  const hasAuthorization = Boolean(session.authorization?.id);
  const hasEmployee = Boolean(session.employee?.id);

  const sessionDate = new Date(session.session.scheduledStart);
  const authorizationStart = session.authorization
    ? new Date(session.authorization.startDate)
    : null;
  const authorizationEnd = session.authorization
    ? new Date(session.authorization.endDate)
    : null;

  const authorizationActive = Boolean(
    session.authorization &&
      (session.authorization.status === "ACTIVE" ||
        session.authorization.status === "EXPIRING"),
  );
  const sessionWithinAuthorizationRange = Boolean(
    authorizationStart &&
      authorizationEnd &&
      sessionDate >= authorizationStart &&
      sessionDate <= authorizationEnd,
  );

  const unitsNeeded =
    session.session.unitsRendered > 0
      ? session.session.unitsRendered
      : Math.max(session.service?.defaultUnitsPerSession ?? 1, 1);
  const unitsRemaining = session.authorization?.remainingUnits ?? 0;
  const unitsAvailable = Boolean(session.authorization && unitsRemaining >= unitsNeeded);
  const unitsRunningLow = unitsAvailable && unitsRemaining - unitsNeeded <= unitsNeeded;

  const progressNoteCompleted = getProgressNoteCompleted(session.session);
  const attendanceBillable =
    session.session.attendanceStatus !== "CANCELLED_NO_SHOW" &&
    session.session.attendanceStatus !== "CANCELLED_LATE";
  const attendanceCompleted = session.session.attendanceStatus === "COMPLETED";

  const hardFails: string[] = [];
  const softFails: string[] = [];

  if (!hasClient) hardFails.push("Session is missing a client relationship.");
  if (!hasCase) hardFails.push("Session is missing a case relationship.");
  if (!hasService) hardFails.push("Session is missing a service relationship.");
  if (!hasAuthorization) hardFails.push("Session is missing an authorization relationship.");
  if (!hasEmployee) hardFails.push("Session is missing an assigned employee.");

  if (!attendanceBillable) {
    hardFails.push("Session is not billable because of its attendance status.");
  }

  if (hasAuthorization && !authorizationActive) {
    hardFails.push("Authorization is not active.");
  } else if (session.authorization?.status === "EXPIRING") {
    softFails.push("Authorization is active but expiring.");
  }

  if (hasAuthorization && !sessionWithinAuthorizationRange) {
    hardFails.push("Session date falls outside the authorization range.");
  }

  if (hasAuthorization && !unitsAvailable) {
    hardFails.push("Authorization does not have enough remaining units.");
  } else if (unitsRunningLow) {
    softFails.push("Authorization has limited units remaining after this session.");
  }

  if (!attendanceCompleted && attendanceBillable) {
    softFails.push("Session has not been completed yet.");
  }

  if (!progressNoteCompleted) {
    softFails.push(getProgressNoteSoftFail(session.session));
  }

  const checks: SessionValidationCheck[] = [
    {
      id: "client",
      label: "Client linked",
      status: getCheckStatus(hasClient),
      detail: hasClient ? "Client relationship is present." : "Client relationship is missing.",
    },
    {
      id: "case",
      label: "Case linked",
      status: getCheckStatus(hasCase),
      detail: hasCase ? "Case relationship is present." : "Case relationship is missing.",
    },
    {
      id: "service",
      label: "Service linked",
      status: getCheckStatus(hasService),
      detail: hasService ? "Service relationship is present." : "Service relationship is missing.",
    },
    {
      id: "authorization",
      label: "Authorization linked",
      status: getCheckStatus(hasAuthorization),
      detail: hasAuthorization
        ? "Authorization relationship is present."
        : "Authorization relationship is missing.",
    },
    {
      id: "employee",
      label: "Employee assigned",
      status: getCheckStatus(hasEmployee),
      detail: hasEmployee
        ? `Assigned to ${session.employee?.displayName}.`
        : "No employee is assigned to this session.",
    },
    {
      id: "authorization-active",
      label: "Authorization active",
      status: !authorizationActive
        ? "fail"
        : session.authorization?.status === "EXPIRING"
          ? "warning"
          : "pass",
      detail: authorizationActive
        ? `Authorization status is ${session.authorization?.status.toLowerCase()}.`
        : "Authorization is not active.",
    },
    {
      id: "authorization-range",
      label: "Session date within authorization range",
      status: getCheckStatus(sessionWithinAuthorizationRange),
      detail: sessionWithinAuthorizationRange
        ? "Session date falls within the authorization range."
        : "Session date falls outside the authorization range.",
    },
    {
      id: "units",
      label: "Units available",
      status: !unitsAvailable ? "fail" : unitsRunningLow ? "warning" : "pass",
      detail: unitsAvailable
        ? `${unitsRemaining} remaining units with ${unitsNeeded} needed for this session.`
        : `${unitsRemaining} remaining units with ${unitsNeeded} needed for this session.`,
    },
    {
      id: "note",
      label: "Progress note completed",
      status: progressNoteCompleted ? "pass" : "warning",
      detail: progressNoteCompleted
        ? "A completed progress note is attached to the session."
        : "Progress note is still draft, pending signature, or missing.",
    },
  ];

  if (!attendanceBillable) {
    checks.push({
      id: "attendance",
      label: "Attendance supports billing",
      status: "fail",
      detail: `Attendance status ${session.session.attendanceStatus.toLowerCase()} is not billable.`,
    });
  } else {
    checks.push({
      id: "attendance",
      label: "Attendance supports billing",
      status: attendanceCompleted ? "pass" : "warning",
      detail: attendanceCompleted
        ? "Session attendance is completed."
        : "Session attendance is still pending completion.",
    });
  }

  const validationStatus: SessionValidationStatus =
    hardFails.length > 0 ? "invalid" : softFails.length > 0 ? "warning" : "valid";
  const billingStatus: SessionBillingOperationalStatus =
    hardFails.length > 0
      ? "NOT_BILLABLE"
      : softFails.length > 0
        ? "AT_RISK"
        : "READY_TO_BILL";

  return {
    validationStatus,
    billingStatus,
    readyToBill: billingStatus === "READY_TO_BILL",
    readinessScore: getReadinessScore(checks),
    hardFails,
    softFails,
    blockers: hardFails,
    warnings: softFails,
    checks,
    ownership: {
      hasClient,
      hasCase,
      hasService,
      hasAuthorization,
      hasEmployee,
    },
    authorizationActive,
    sessionWithinAuthorizationRange,
    unitsAvailable,
    progressNoteCompleted,
    attendanceBillable,
    attendanceCompleted,
    unitsNeeded,
    unitsRemaining,
  };
}

export function getPersistedBillingStatusFromOperationalStatus(
  status: SessionBillingOperationalStatus,
): BillingStatus {
  if (status === "READY_TO_BILL") return "READY";
  if (status === "AT_RISK") return "HOLD";
  return "DENIED";
}

export function getSynchronizedSessionBillingStatus(session: SessionContext): BillingStatus {
  if (
    session.session.billingStatus === "SUBMITTED" ||
    session.session.billingStatus === "PAID"
  ) {
    return session.session.billingStatus;
  }

  return getPersistedBillingStatusFromOperationalStatus(
    validateSession(session).billingStatus,
  );
}

export function getSessionBillingStatusLabel(status: SessionBillingOperationalStatus) {
  if (status === "READY_TO_BILL") return "Ready to bill";
  if (status === "AT_RISK") return "At risk";
  return "Not billable";
}

export function getSessionValidationStatusLabel(status: SessionValidationStatus) {
  if (status === "valid") return "Valid";
  if (status === "warning") return "Warning";
  return "Invalid";
}
