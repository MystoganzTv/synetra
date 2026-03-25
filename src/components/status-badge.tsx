import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";

const successValues = new Set([
  "ACTIVE",
  "SIGNED",
  "LOCKED",
  "PAID",
  "RESOLVED",
  "COMPLETED",
  "CURRENT",
  "COMPLETE",
]);

const warningValues = new Set([
  "INTAKE",
  "ON_HOLD",
  "HOLD",
  "PENDING_SIGNATURE",
  "READY",
  "SUBMITTED",
  "EXPIRING",
  "SCHEDULED",
  "DOCUMENTATION_PENDING",
  "MODERATE",
  "EXPIRING",
  "PENDING_REVIEW",
  "IN_PROGRESS",
  "NEEDS_REVIEW",
  "PARTIAL",
  "SENT",
  "PLANNING",
  "PENDING",
  "DRAFT",
]);

const dangerValues = new Set([
  "DENIED",
  "OPEN",
  "EXPIRED",
  "HIGH",
  "CANCELLED_LATE",
  "CANCELLED_NO_SHOW",
]);

export function StatusBadge({ value }: { value: string }) {
  const variant = successValues.has(value)
    ? "success"
    : warningValues.has(value)
      ? "warning"
      : dangerValues.has(value)
        ? "danger"
        : "outline";

  return <Badge variant={variant}>{formatEnumLabel(value)}</Badge>;
}
