import { Badge } from "@/components/ui/badge";
import type { OperationalIssueType } from "@/lib/operational-intelligence";

const labels: Record<OperationalIssueType, string> = {
  MISSING_NOTE: "Missing note",
  EXPIRED_AUTHORIZATION: "Authorization",
  MISSING_REQUIRED_DOCUMENT: "Required document",
  NON_BILLABLE_SESSION: "Non-billable",
  BILLING_READINESS: "Readiness",
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
