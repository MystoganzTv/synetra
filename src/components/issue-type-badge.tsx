import { Badge } from "@/components/ui/badge";
import type { OperationalIssueType } from "@/lib/operational-intelligence";

const labels: Record<OperationalIssueType, string> = {
  MISSING_NOTE: "Nota faltante",
  EXPIRED_AUTHORIZATION: "Autorización",
  MISSING_REQUIRED_DOCUMENT: "Documento requerido",
  NON_BILLABLE_SESSION: "No facturable",
  BILLING_READINESS: "Preparación",
};

export function IssueTypeBadge({ type }: { type: OperationalIssueType }) {
  const variant =
    type === "NON_BILLABLE_SESSION"
      ? "danger"
      : type === "EXPIRED_AUTHORIZATION"
        ? "warning"
        : type === "MISSING_REQUIRED_DOCUMENT"
          ? "info"
          : "outline";

  return <Badge variant={variant}>{labels[type]}</Badge>;
}
