const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const enumLabelMap: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  LEAD: "Lead",
  INTAKE: "Intake",
  HOLD: "On Hold",
  ON_HOLD: "On Hold",
  CLOSED: "Closed",
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  ABA: "ABA",
  MENTAL_HEALTH: "Mental Health",
  CARE_COORDINATION: "Care Coordination",
  SCHOOL_SUPPORT: "School Support",
  THERAPY: "Therapy",
  PSYCHIATRY: "Psychiatry",
  SKILLS_TRAINING: "Skills Training",
  REQUESTED: "Requested",
  EXPIRING: "Expiring",
  EXPIRED: "Expired",
  DENIED: "Denied",
  UNITS: "Units",
  HOURS: "Hours",
  VISITS: "Visits",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED_NO_SHOW: "No Show",
  CANCELLED_LATE: "Late Cancel",
  DOCUMENTATION_PENDING: "Documentation Pending",
  DRAFT: "Draft",
  PENDING_SIGNATURE: "Pending Signature",
  SIGNED: "Signed",
  LOCKED: "Locked",
  READY: "Ready",
  SUBMITTED: "Submitted",
  PAID: "Paid",
  OPEN: "Open",
  RESOLVED: "Resolved",
  WAIVED: "Waived",
  CURRENT: "Current",
  PENDING_REVIEW: "Pending Review",
  PLANNING: "Planning",
  PENDING: "Pending",
  COMPLETE: "Complete",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  NOT_STARTED: "Not Started",
  SENT: "Sent",
  PARTIAL: "Partial",
};

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "No date";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "Not scheduled";
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "No time";
  return timeFormatter.format(new Date(value));
}

export function formatWeekdayDate(value: string | Date | null | undefined) {
  if (!value) return "No date";
  return weekdayDateFormatter.format(new Date(value));
}

export function formatEnumLabel(value: string) {
  if (enumLabelMap[value]) {
    return enumLabelMap[value];
  }

  return value
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) {
    return "No file";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

export function calculateAge(dateOfBirth: string | Date) {
  const birthDate = new Date(dateOfBirth);
  const today = getNow();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}
import { getNow } from "@/lib/time";
